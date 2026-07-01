import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getLikeState, toggleLike } from "@/lib/likes";
import { getPostBySlug } from "@/lib/posts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const visitorCookie = "synthetic_eye_visitor";
const cookieMaxAge = 60 * 60 * 24 * 365;

function isValidSlug(slug: string) {
  return /^[a-z0-9][a-z0-9-]*$/i.test(slug) && getPostBySlug(slug) !== null;
}

function getVisitorId(request: NextRequest) {
  const existing = request.cookies.get(visitorCookie)?.value;
  if (existing && /^[0-9a-f-]{36}$/i.test(existing)) return existing;
  return randomUUID();
}

function withVisitorCookie(response: NextResponse, visitorId: string) {
  response.cookies.set(visitorCookie, visitorId, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: cookieMaxAge,
    path: "/",
  });
  return response;
}

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug") ?? "";
  if (!isValidSlug(slug)) return jsonError("Invalid post slug", 400);

  const visitorId = getVisitorId(request);
  try {
    const state = getLikeState(slug, visitorId);
    return withVisitorCookie(NextResponse.json(state), visitorId);
  } catch {
    return jsonError("Like storage unavailable", 500);
  }
}

export async function POST(request: NextRequest) {
  let slug = "";
  try {
    const body = (await request.json()) as { slug?: unknown };
    slug = typeof body.slug === "string" ? body.slug : "";
  } catch {
    return jsonError("Invalid request body", 400);
  }

  if (!isValidSlug(slug)) return jsonError("Invalid post slug", 400);

  const visitorId = getVisitorId(request);
  try {
    const state = toggleLike(slug, visitorId);
    return withVisitorCookie(NextResponse.json(state), visitorId);
  } catch {
    return jsonError("Like storage unavailable", 500);
  }
}
