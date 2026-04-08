import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const forwardRequest = async (request: NextRequest, path: string[]) => {
  const search = request.nextUrl.search || "";
  const targetUrl = `${BACKEND_URL}/${path.join("/")}${search}`;
  const headers = new Headers();

  const authorization = request.headers.get("authorization");
  const contentType = request.headers.get("content-type");

  if (authorization) {
    headers.set("authorization", authorization);
  }

  if (contentType) {
    headers.set("content-type", contentType);
  }

  const method = request.method.toUpperCase();
  const body =
    method === "GET" || method === "HEAD" ? undefined : Buffer.from(await request.arrayBuffer());

  try {
    const response = await fetch(targetUrl, {
      method,
      headers,
      body,
      cache: "no-store"
    });

    const responseBody = await response.arrayBuffer();
    const nextResponse = new NextResponse(responseBody, {
      status: response.status,
      statusText: response.statusText
    });

    const responseContentType = response.headers.get("content-type");
    if (responseContentType) {
      nextResponse.headers.set("content-type", responseContentType);
    }

    return nextResponse;
  } catch (error) {
    const message =
      error instanceof Error
        ? `Proxy could not reach backend at ${BACKEND_URL}: ${error.message}`
        : `Proxy could not reach backend at ${BACKEND_URL}`;

    return NextResponse.json({ message }, { status: 502 });
  }
};

export async function GET(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  return forwardRequest(request, path);
}

export async function POST(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  return forwardRequest(request, path);
}

export async function PUT(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  return forwardRequest(request, path);
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  return forwardRequest(request, path);
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  return forwardRequest(request, path);
}
