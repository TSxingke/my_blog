"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

/** 底层网格+连线略淡；粒子单独一层（略提高不透明度，在毛玻璃等叠层下仍可见） */
const GRID_LAYER_OPACITY = 0.1;
const PARTICLE_LAYER_OPACITY = 0.38;

const PARTICLE_COUNT = 400;

const LINK_DIST = 150;
const LINK_DIST2 = LINK_DIST * LINK_DIST;
const REPULSE_DIST = 100;
const REPULSE_DIST2 = REPULSE_DIST * REPULSE_DIST;
const MOVE_SPEED = 0.5;

/** 散开时长（略长，便于铺满全屏后再进入下一轮聚拢） */
const CYCLE_SCATTER_MS = 21000;
/** 至少聚拢这么久才允许判定爆开（避免一开始误爆） */
const MIN_GATHER_MS = 2800;
/** 最久等成环；超时强制爆开防止卡死 */
const MAX_GATHER_MS = 12800;
/** 落在环目标附近的粒子占比 ≥ 此值则视为可爆 */
const RING_READY_FRAC = 0.66;
/** 用于弹簧/环旋转进度归一（与原先固定聚拢段同量级） */
const GATHER_CURVE_MS = 6400;

/** 空间划分单元：略小于连线距离，查 3×3 邻格即可覆盖 LINK_DIST */
const GRID_CELL = 80;

type ParticleKind = "white" | "dark" | "cyan";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseAngle: number;
  kind: ParticleKind;
  r: number;
  /** 圆环上的目标方位角（聚拢时拉向环上对应点） */
  ringAngle: number;
};

function rollKind(): ParticleKind {
  const u = Math.random();
  if (u < 0.045) return "cyan";
  return u < 0.62 ? "white" : "dark";
}

const REGION_FR = 0.3;

/** 在矩形 [x0,x0+rw]×[y0,y0+rh] 内均匀取点（整块区域有密度，不挤在角点） */
function sampleInRect(x0: number, y0: number, rw: number, rh: number) {
  return {
    x: x0 + Math.random() * rw,
    y: y0 + Math.random() * rh,
  };
}

/**
 * 60% 全屏均匀；40% 一半落在左下 30%×30% 区域、一半落在右上 30%×30% 区域（区域内均匀）。
 */
function biasedPosition(w: number, h: number): { x: number; y: number } {
  if (Math.random() < 0.6) {
    return { x: Math.random() * w, y: Math.random() * h };
  }
  const rw = w * REGION_FR;
  const rh = h * REGION_FR;
  if (Math.random() < 0.5) {
    return sampleInRect(0, h - rh, rw, rh);
  }
  return sampleInRect(w - rw, 0, rw, rh);
}

function initParticles(w: number, h: number, n: number): Particle[] {
  return Array.from({ length: n }, (_, i) => {
    const pos = biasedPosition(w, h);
    const baseAngle = Math.random() * Math.PI * 2;
    return {
      x: pos.x,
      y: pos.y,
      vx: Math.cos(baseAngle) * MOVE_SPEED * 0.35,
      vy: Math.sin(baseAngle) * MOVE_SPEED * 0.35,
      baseAngle,
      kind: rollKind(),
      r: 1.15 + Math.random() * 0.55,
      ringAngle: ((i + 0.5) / n) * Math.PI * 2 + (Math.random() - 0.5) * 0.1,
    };
  });
}

function drawCyberGrid(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  shiftX: number,
  shiftY: number,
) {
  const step = 40;
  ctx.strokeStyle = "rgba(62, 68, 78, 0.32)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  const sx = ((-shiftX % step) + step) % step;
  const sy = ((-shiftY % step) + step) % step;
  for (let x = sx; x < w; x += step) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
  }
  for (let y = sy; y < h; y += step) {
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
  }
  ctx.stroke();
}

function bounceParticle(p: Particle, w: number, h: number) {
  const eps = 0.75;
  if (p.x < eps) {
    p.x = eps;
    p.vx = Math.abs(p.vx) * 0.92 + 0.04;
  } else if (p.x > w - eps) {
    p.x = w - eps;
    p.vx = -Math.abs(p.vx) * 0.92 - 0.04;
  }
  if (p.y < eps) {
    p.y = eps;
    p.vy = Math.abs(p.vy) * 0.92 + 0.04;
  } else if (p.y > h - eps) {
    p.y = h - eps;
    p.vy = -Math.abs(p.vy) * 0.92 - 0.04;
  }
}

/** 两端都贴在同一条「边附近」时不画连线，避免沿周界连成一条亮线 */
function bothNearSameScreenEdge(
  ax: number,
  ay: number,
  bx: number,
  by: number,
  w: number,
  h: number,
  margin: number,
): boolean {
  return (
    (ay < margin && by < margin) ||
    (ay > h - margin && by > h - margin) ||
    (ax < margin && bx < margin) ||
    (ax > w - margin && bx > w - margin)
  );
}

function strokeLink(
  a: Particle,
  b: Particle,
  ctx: CanvasRenderingContext2D,
  ox: number,
  oy: number,
  w: number,
  h: number,
) {
  const margin = Math.min(w, h) * 0.065;
  if (bothNearSameScreenEdge(a.x, a.y, b.x, b.y, w, h, margin)) return;

  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const d2 = dx * dx + dy * dy;
  if (d2 >= LINK_DIST2 || d2 <= 4) return;
  const d = Math.sqrt(d2);
  const t = 1 - d / LINK_DIST;
  const linkA = 0.055 + t * 0.09;
  ctx.strokeStyle = `rgba(220, 232, 245, ${linkA})`;
  ctx.beginPath();
  ctx.moveTo(a.x + ox, a.y + oy);
  ctx.lineTo(b.x + ox, b.y + oy);
  ctx.stroke();
}

/** 3×3 邻格，避免 O(n²)（n=400 时约 8 万次对比 → 每帧可接受） */
function drawLinksSpatial(
  parts: Particle[],
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  ox: number,
  oy: number,
) {
  const cell = GRID_CELL;
  const cols = Math.max(1, Math.ceil(w / cell));
  const rows = Math.max(1, Math.ceil(h / cell));
  const gridN = cols * rows;
  const grid: number[][] = Array.from({ length: gridN }, () => []);

  for (let i = 0; i < parts.length; i++) {
    const p = parts[i];
    const rawGx = Math.floor(p.x / cell);
    const rawGy = Math.floor(p.y / cell);
    const gx = Number.isFinite(rawGx)
      ? Math.max(0, Math.min(cols - 1, rawGx))
      : 0;
    const gy = Number.isFinite(rawGy)
      ? Math.max(0, Math.min(rows - 1, rawGy))
      : 0;
    const idx = gy * cols + gx;
    if (idx >= 0 && idx < grid.length) {
      grid[idx].push(i);
    }
  }

  ctx.lineWidth = 1;
  for (let cellY = 0; cellY < rows; cellY++) {
    for (let cellX = 0; cellX < cols; cellX++) {
      const base = cellY * cols + cellX;
      const listA = grid[base];
      if (!listA?.length) continue;

      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const cx2 = cellX + dx;
          const cy2 = cellY + dy;
          if (cx2 < 0 || cx2 >= cols || cy2 < 0 || cy2 >= rows) continue;
          const idxB = cy2 * cols + cx2;
          if (idxB < base || idxB >= grid.length) continue;
          const listB = grid[idxB];
          if (!listB) continue;

          if (idxB === base) {
            for (let ii = 0; ii < listA.length; ii++) {
              const ai = listA[ii];
              for (let jj = ii + 1; jj < listB.length; jj++) {
                strokeLink(parts[ai], parts[listB[jj]], ctx, ox, oy, w, h);
              }
            }
          } else {
            for (const ai of listA) {
              for (const bi of listB) {
                strokeLink(parts[ai], parts[bi], ctx, ox, oy, w, h);
              }
            }
          }
        }
      }
    }
  }
}

/** 单层实心点：偏亮、偏冷灰，不叠 shadow/渐变，避免糊成光晕 */
function drawParticleCrisp(
  ctx: CanvasRenderingContext2D,
  px: number,
  py: number,
  r: number,
  kind: ParticleKind,
) {
  ctx.globalAlpha = 1;
  if (kind === "cyan") {
    ctx.fillStyle = "#7afeff";
    ctx.beginPath();
    ctx.arc(px, py, r * 1.02, 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === "white") {
    ctx.fillStyle = "#f6f9ff";
    ctx.beginPath();
    ctx.arc(px, py, r, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillStyle = "#b9c6d8";
    ctx.beginPath();
    ctx.arc(px, py, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

type Props = {
  children: ReactNode;
  /** 为 false 时不绘制粒子与连线，仅保留与首页一致的动态网格（canvas）或减弱动效下的静态网格层 */
  particles?: boolean;
};

type MousePxState = {
  x: number;
  y: number;
  active: boolean;
  /** 0–1，由鼠标位移驱动；静止时衰减，避免光标停中央时持续把粒子推向四周 */
  repulseBoost: number;
};

function setupCanvasDpr(canvas: HTMLCanvasElement, dpr: number) {
  const w = window.innerWidth;
  const h = window.innerHeight;
  canvas.width = Math.floor(w * dpr);
  canvas.height = Math.floor(h * dpr);
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;
  const ctx = canvas.getContext("2d");
  if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

export function HeroDataFlowBackground({
  children,
  particles = true,
}: Props) {
  const showParticlesRef = useRef(particles);
  showParticlesRef.current = particles;
  const gridCanvasRef = useRef<HTMLCanvasElement>(null);
  const particleCanvasRef = useRef<HTMLCanvasElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseNormRef = useRef({ x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 });
  const mousePxRef = useRef<MousePxState>({
    x: 0,
    y: 0,
    active: false,
    repulseBoost: 0,
  });
  const parallaxRef = useRef({ x: 0, y: 0 });
  const frameRef = useRef(0);
  const heroVisibleRef = useRef(true);
  const reducedMotionRef = useRef(false);
  const lastFrameNowRef = useRef(0);
  const inGatherRef = useRef(true);
  const gatherMsRef = useRef(0);
  const scatterMsRef = useRef(0);

  const [reducedMotion, setReducedMotion] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  const resizeCanvas = useCallback(() => {
    const gridCv = gridCanvasRef.current;
    if (!gridCv) return;
    const dpr = Math.min(window.devicePixelRatio ?? 1, 2);
    setupCanvasDpr(gridCv, dpr);
    if (!showParticlesRef.current) return;
    const particleCv = particleCanvasRef.current;
    if (!particleCv) return;
    setupCanvasDpr(particleCv, dpr);
    const w = window.innerWidth;
    const h = window.innerHeight;
    const n = PARTICLE_COUNT;
    if (
      particlesRef.current.length === 0 ||
      particlesRef.current.length !== n
    ) {
      particlesRef.current = initParticles(w, h, n);
    }
  }, []);

  const drawFrame = useCallback(() => {
    const gridCv = gridCanvasRef.current;
    if (!gridCv || reducedMotionRef.current) return;
    const ctxGrid = gridCv.getContext("2d");
    if (!ctxGrid) return;

    const w = window.innerWidth;
    const h = window.innerHeight;
    const { x: mx, y: my, tx, ty } = mouseNormRef.current;
    mouseNormRef.current.x += (tx - mx) * 0.1;
    mouseNormRef.current.y += (ty - my) * 0.1;
    const targetPx = (mouseNormRef.current.x - 0.5) * 14;
    const targetPy = (mouseNormRef.current.y - 0.5) * 14;
    parallaxRef.current.x += (targetPx - parallaxRef.current.x) * 0.08;
    parallaxRef.current.y += (targetPy - parallaxRef.current.y) * 0.08;
    const ox = parallaxRef.current.x;
    const oy = parallaxRef.current.y;

    ctxGrid.clearRect(0, 0, w, h);
    drawCyberGrid(ctxGrid, w, h, ox * 0.25, oy * 0.25);

    if (!showParticlesRef.current) {
      return;
    }

    const particleCv = particleCanvasRef.current;
    if (!particleCv) return;
    const ctxParticle = particleCv.getContext("2d");
    if (!ctxParticle) return;

    const parts = particlesRef.current;
    const mp = mousePxRef.current;
    mp.repulseBoost *= 0.982;

    const cx = w * 0.5;
    const cy = h * 0.5;

    const now = performance.now();
    if (lastFrameNowRef.current === 0) lastFrameNowRef.current = now;
    const dtMs = Math.min(64, now - lastFrameNowRef.current);
    lastFrameNowRef.current = now;

    const ringR = Math.min(w, h) * 0.24;

    if (inGatherRef.current) {
      gatherMsRef.current += dtMs;
    } else {
      scatterMsRef.current += dtMs;
    }

    const gatherNorm = Math.min(1, gatherMsRef.current / GATHER_CURVE_MS);
    const ringSpin = gatherNorm * 0.65;

    if (inGatherRef.current) {
      const eps = Math.min(w, h) * 0.048;
      let close = 0;
      for (const p of parts) {
        const ta = p.ringAngle + ringSpin;
        const ttx = cx + ringR * Math.cos(ta);
        const tty = cy + ringR * Math.sin(ta);
        if (Math.hypot(p.x - ttx, p.y - tty) < eps) close++;
      }
      const readiness =
        parts.length > 0 ? close / parts.length : 0;

      const canBurst =
        gatherMsRef.current >= MIN_GATHER_MS &&
        (readiness >= RING_READY_FRAC ||
          gatherMsRef.current >= MAX_GATHER_MS);

      if (canBurst) {
        for (const p of parts) {
          const dx = p.x - cx;
          const dy = p.y - cy;
          let dist = Math.hypot(dx, dy);
          if (dist < 10) dist = 10;
          const nx = dx / dist;
          const ny = dy / dist;
          const burst = 7.2 + Math.random() * 5.8;
          p.vx += nx * burst;
          p.vy += ny * burst;
        }
        inGatherRef.current = false;
        gatherMsRef.current = 0;
        scatterMsRef.current = 0;
      }
    } else if (scatterMsRef.current >= CYCLE_SCATTER_MS) {
      inGatherRef.current = true;
      gatherMsRef.current = 0;
      scatterMsRef.current = 0;
    }

    const inGather = inGatherRef.current;
    let springK = 0;
    if (inGather) {
      const curve = gatherNorm * gatherNorm * (3 - 2 * gatherNorm);
      springK = 0.000025 + curve * 0.00046;
    }

    const scatterU = inGather
      ? 0
      : Math.min(1, scatterMsRef.current / Math.max(1, CYCLE_SCATTER_MS));

    const wander = inGather
      ? 0.032
      : 0.038 + scatterU * scatterU * 0.072;
    const steer = inGather
      ? 0.032
      : 0.011 + scatterU * scatterU * 0.052;
    const vCap = inGather
      ? 1.24
      : Math.max(1.42, 6.5 - scatterU * scatterU * 4.0);
    const drag = inGather
      ? 0.996
      : 0.99994 - Math.pow(scatterU, 1.9) * 0.0024;

    for (const p of parts) {
      if (inGather) {
        const ta = p.ringAngle + ringSpin;
        const tx = cx + ringR * Math.cos(ta);
        const ty = cy + ringR * Math.sin(ta);
        p.vx += (tx - p.x) * springK;
        p.vy += (ty - p.y) * springK;

        const rdx = p.x - cx;
        const rdy = p.y - cy;
        const rd = Math.hypot(rdx, rdy);
        if (rd > 5 && rd < ringR * 0.33) {
          const push = 0.026 * (1 - rd / (ringR * 0.33));
          p.vx += (rdx / rd) * push;
          p.vy += (rdy / rd) * push;
        }
      }

      if (mp.active && mp.repulseBoost > 0.035) {
        const dx = p.x - mp.x;
        const dy = p.y - mp.y;
        const d2 = dx * dx + dy * dy;
        if (d2 > 1 && d2 < REPULSE_DIST2) {
          const d = Math.sqrt(d2);
          const t = 1 - d / REPULSE_DIST;
          const push = t * t * 0.48 * mp.repulseBoost;
          p.vx += (dx / d) * push;
          p.vy += (dy / d) * push;
        }
      }

      /** 散开阶段：靠边粒子加随机扰动 + 极弱向心扩散，打散「贴边一条线」、更均匀 */
      if (!inGather) {
        const band = Math.min(w, h) * 0.08;
        const dn = Math.min(p.x, p.y, w - p.x, h - p.y);
        if (dn < band) {
          const u = 1 - dn / band;
          const j = 0.05 * u * (0.55 + scatterU * 0.5);
          p.vx += (Math.random() - 0.5) * j;
          p.vy += (Math.random() - 0.5) * j;
          p.vx += ((cx - p.x) / Math.max(w, h)) * 0.0014 * u;
          p.vy += ((cy - p.y) / Math.max(w, h)) * 0.0014 * u;
        }
      }

      p.baseAngle += (Math.random() - 0.5) * wander;
      const targetVx = Math.cos(p.baseAngle) * MOVE_SPEED;
      const targetVy = Math.sin(p.baseAngle) * MOVE_SPEED;
      p.vx += (targetVx - p.vx) * steer;
      p.vy += (targetVy - p.vy) * steer;

      const vm = Math.hypot(p.vx, p.vy);
      if (vm > vCap) {
        p.vx *= vCap / vm;
        p.vy *= vCap / vm;
      }

      p.x += p.vx;
      p.y += p.vy;
      bounceParticle(p, w, h);
      p.vx *= drag;
      p.vy *= drag;

      if (!Number.isFinite(p.x) || !Number.isFinite(p.y)) {
        p.x = Math.max(2, Math.min(w - 2, cx));
        p.y = Math.max(2, Math.min(h - 2, cy));
      }
      if (!Number.isFinite(p.vx)) p.vx = 0;
      if (!Number.isFinite(p.vy)) p.vy = 0;
    }

    ctxParticle.clearRect(0, 0, w, h);
    /** 连线与粒子同层（粒子层不透明度更高）；若在网格层画线会被 GRID_LAYER_OPACITY 压暗 */
    drawLinksSpatial(parts, ctxParticle, w, h, ox, oy);
    for (const p of parts) {
      drawParticleCrisp(
        ctxParticle,
        p.x + ox,
        p.y + oy,
        p.r,
        p.kind,
      );
    }
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMq = () => {
      const r = mq.matches;
      reducedMotionRef.current = r;
      setReducedMotion(r);
      if (r && frameRef.current) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = 0;
      }
    };
    onMq();
    mq.addEventListener("change", onMq);
    return () => mq.removeEventListener("change", onMq);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;

    const gridCv = gridCanvasRef.current;
    const sentinel = sentinelRef.current;
    if (!gridCv || !sentinel) return;
    if (showParticlesRef.current && !particleCanvasRef.current) return;

    resizeCanvas();

    const onResize = () => resizeCanvas();
    window.addEventListener("resize", onResize);

    const onMouse = (e: MouseEvent) => {
      const iw = window.innerWidth;
      const ih = window.innerHeight;
      mouseNormRef.current.tx = e.clientX / iw;
      mouseNormRef.current.ty = e.clientY / ih;
      const prev = mousePxRef.current;
      const dist = prev.active
        ? Math.hypot(e.clientX - prev.x, e.clientY - prev.y)
        : 0;
      mousePxRef.current = {
        x: e.clientX,
        y: e.clientY,
        active: true,
        repulseBoost: Math.min(
          1,
          prev.repulseBoost * 0.88 + Math.min(dist, 80) * 0.026,
        ),
      };
    };
    window.addEventListener("mousemove", onMouse, { passive: true });

    const runLoop = () => {
      if (!heroVisibleRef.current || reducedMotionRef.current) {
        frameRef.current = 0;
        return;
      }
      drawFrame();
      frameRef.current = requestAnimationFrame(runLoop);
    };

    const syncVisibility = (visible: boolean) => {
      heroVisibleRef.current = visible;
      if (!visible) {
        if (frameRef.current) {
          cancelAnimationFrame(frameRef.current);
          frameRef.current = 0;
        }
        return;
      }
      if (!frameRef.current) {
        frameRef.current = requestAnimationFrame(runLoop);
      }
    };

    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries[0];
        syncVisibility(hit?.isIntersecting ?? false);
      },
      { root: null, threshold: 0, rootMargin: "0px" },
    );
    io.observe(sentinel);
    const pending = io.takeRecords();
    if (pending.length > 0) {
      syncVisibility(pending[0]?.isIntersecting ?? true);
    } else {
      syncVisibility(true);
    }

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouse);
      io.disconnect();
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      frameRef.current = 0;
    };
  }, [reducedMotion, drawFrame, resizeCanvas]);

  const staticGridStyle = {
    opacity: 0.06,
    backgroundImage: `
      linear-gradient(rgba(70, 76, 86, 0.95) 1px, transparent 1px),
      linear-gradient(90deg, rgba(70, 76, 86, 0.95) 1px, transparent 1px)
    `,
    backgroundSize: "40px 40px",
  } as const;

  return (
    <div className="relative isolate z-0 flex min-h-dvh w-full flex-1 flex-col">
      <div
        ref={sentinelRef}
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[100dvh]"
        aria-hidden
      />

      {reducedMotion ? (
        <div
          className="pointer-events-none fixed inset-0 z-[6]"
          style={staticGridStyle}
          aria-hidden
        />
      ) : (
        <>
          <div
            className="pointer-events-none fixed inset-0 z-[6]"
            style={{ opacity: GRID_LAYER_OPACITY }}
            aria-hidden
          >
            <canvas
              ref={gridCanvasRef}
              className="block h-full w-full"
            />
          </div>
          {particles ? (
            <div
              className="pointer-events-none fixed inset-0 z-[28]"
              style={{ opacity: PARTICLE_LAYER_OPACITY }}
              aria-hidden
            >
              <canvas
                ref={particleCanvasRef}
                className="block h-full w-full"
              />
            </div>
          ) : null}
        </>
      )}

      <div className="relative z-[32] flex flex-1 flex-col">{children}</div>
    </div>
  );
}
