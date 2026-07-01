"use client";

import { useEffect, useMemo, useState } from "react";

type LikeState = {
  count: number;
  liked: boolean;
};

type RequestState = "idle" | "loading" | "saving" | "error";

export function LikeButton({ slug }: { slug: string }) {
  const [likeState, setLikeState] = useState<LikeState>({ count: 0, liked: false });
  const [requestState, setRequestState] = useState<RequestState>("loading");

  const label = useMemo(() => {
    if (requestState === "loading") return "正在读取点赞数";
    if (likeState.liked) return "取消点赞";
    return "点赞这篇文章";
  }, [likeState.liked, requestState]);

  useEffect(() => {
    let alive = true;

    async function loadLikeState() {
      try {
        const response = await fetch(`/api/likes?slug=${encodeURIComponent(slug)}`, {
          cache: "no-store",
        });
        if (!response.ok) throw new Error("Failed to load likes");
        const data = (await response.json()) as LikeState;
        if (!alive) return;
        setLikeState(data);
        setRequestState("idle");
      } catch {
        if (!alive) return;
        setRequestState("error");
      }
    }

    loadLikeState();
    return () => {
      alive = false;
    };
  }, [slug]);

  async function handleClick() {
    if (requestState === "loading" || requestState === "saving") return;

    const previous = likeState;
    const optimistic = {
      liked: !previous.liked,
      count: Math.max(0, previous.count + (previous.liked ? -1 : 1)),
    };

    setLikeState(optimistic);
    setRequestState("saving");

    try {
      const response = await fetch("/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      if (!response.ok) throw new Error("Failed to save like");
      const data = (await response.json()) as LikeState;
      setLikeState(data);
      setRequestState("idle");
    } catch {
      setLikeState(previous);
      setRequestState("error");
    }
  }

  const busy = requestState === "loading" || requestState === "saving";

  return (
    <div className="post-like-wrap">
      <button
        type="button"
        className={[
          "post-like-button",
          likeState.liked ? "post-like-button-liked" : "",
          busy ? "post-like-button-busy" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        onClick={handleClick}
        disabled={requestState === "loading"}
        aria-pressed={likeState.liked}
        aria-label={label}
      >
        <span aria-hidden="true" className="post-like-heart">
          {likeState.liked ? "♥" : "♡"}
        </span>
        <span className="post-like-count">{likeState.count}</span>
      </button>
      {requestState === "error" ? (
        <span className="post-like-error" role="status">
          点赞暂时不可用
        </span>
      ) : null}
    </div>
  );
}
