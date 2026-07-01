import { execFileSync } from "child_process";
import fs from "fs";
import path from "path";

const defaultDbPath = path.join(process.cwd(), ".data", "likes.sqlite");
const dbPath = process.env.LIKE_DB_PATH ?? defaultDbPath;

let initialized = false;

function quoteSql(value: string) {
  return `'${value.replaceAll("'", "''")}'`;
}

function runSql(sql: string) {
  ensureDb();
  return execFileSync("sqlite3", [dbPath, sql], {
    encoding: "utf8",
    maxBuffer: 1024 * 1024,
  });
}

function ensureDb() {
  if (initialized) return;
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  execFileSync(
    "sqlite3",
    [
      dbPath,
      `
PRAGMA journal_mode=WAL;
CREATE TABLE IF NOT EXISTS post_likes (
  slug TEXT NOT NULL,
  visitor_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (slug, visitor_id)
);
CREATE INDEX IF NOT EXISTS idx_post_likes_slug ON post_likes(slug);
`,
    ],
    { encoding: "utf8", maxBuffer: 1024 * 1024 },
  );
  initialized = true;
}

export function getLikeState(slug: string, visitorId: string) {
  const quotedSlug = quoteSql(slug);
  const quotedVisitor = quoteSql(visitorId);
  const output = runSql(`
SELECT COUNT(*) FROM post_likes WHERE slug = ${quotedSlug};
SELECT COUNT(*) FROM post_likes WHERE slug = ${quotedSlug} AND visitor_id = ${quotedVisitor};
`);
  const [countRaw = "0", likedRaw = "0"] = output.trim().split(/\r?\n/);
  return {
    count: Number.parseInt(countRaw, 10) || 0,
    liked: (Number.parseInt(likedRaw, 10) || 0) > 0,
  };
}

export function toggleLike(slug: string, visitorId: string) {
  const current = getLikeState(slug, visitorId);
  const quotedSlug = quoteSql(slug);
  const quotedVisitor = quoteSql(visitorId);

  if (current.liked) {
    runSql(`
BEGIN IMMEDIATE;
DELETE FROM post_likes WHERE slug = ${quotedSlug} AND visitor_id = ${quotedVisitor};
COMMIT;
`);
  } else {
    runSql(`
BEGIN IMMEDIATE;
INSERT OR IGNORE INTO post_likes (slug, visitor_id) VALUES (${quotedSlug}, ${quotedVisitor});
COMMIT;
`);
  }

  return getLikeState(slug, visitorId);
}
