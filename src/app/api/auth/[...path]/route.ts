import { auth } from "@/lib/auth/server";
import { NextResponse } from "next/server";

const fallbackHandler = () =>
  NextResponse.json(
    { error: "Auth not configured" },
    { status: 503 }
  );

const handlers = auth?.handler() ?? {
  GET: fallbackHandler,
  POST: fallbackHandler,
  PUT: fallbackHandler,
  DELETE: fallbackHandler,
  PATCH: fallbackHandler,
};

export const { GET, POST, PUT, DELETE, PATCH } = handlers;
