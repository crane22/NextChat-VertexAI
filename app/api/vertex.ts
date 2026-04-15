import { NextRequest, NextResponse } from "next/server";
import { auth } from "./auth";
import { getServerSideConfig } from "@/app/config/server";
import { ApiPath, ModelProvider } from "@/app/constant";
import { prettyObject } from "@/app/utils/format";

const serverConfig = getServerSideConfig();

export async function handle(
  req: NextRequest,
  { params }: { params: { provider: string; path: string[] } },
) {
  console.log("[Vertex Route] params ", params);

  if (req.method === "OPTIONS") {
    return NextResponse.json({ body: "OK" }, { status: 200 });
  }

  const authResult = auth(req, ModelProvider.GoogleVertex);
  if (authResult.error) {
    return NextResponse.json(authResult, {
      status: 401,
    });
  }

  const bearToken = req.headers.get("Authorization") || "";
  const token = bearToken.trim().replaceAll("Bearer ", "").trim();

  // For Vertex, we require the user to provide the token from client,
  // or we could use serverConfig if it was implemented (e.g. serverConfig.vertexApiKey)
  // Let's assume the user configures it in the client for now.
  const apiKey = token;

  if (!apiKey) {
    return NextResponse.json(
      {
        error: true,
        message: `missing Vertex API Key or Token`,
      },
      {
        status: 401,
      },
    );
  }
  try {
    const response = await request(req, apiKey);
    return response;
  } catch (e) {
    console.error("[Vertex] ", e);
    return NextResponse.json(prettyObject(e));
  }
}

export const GET = handle;
export const POST = handle;

export const runtime = "edge";
export const preferredRegion = [
  "bom1",
  "cle1",
  "cpt1",
  "gru1",
  "hnd1",
  "iad1",
  "icn1",
  "kix1",
  "pdx1",
  "sfo1",
  "sin1",
  "syd1",
];

async function request(req: NextRequest, apiKey: string) {
  const controller = new AbortController();

  let path = `${req.nextUrl.pathname}`.replaceAll(ApiPath.GoogleVertex, "");

  const segments = path.split("/");
  let region = "us-central1";
  if (
    segments.length >= 5 &&
    segments[1] === "projects" &&
    segments[3] === "locations"
  ) {
    region = segments[4];
  }

  let baseUrl = `https://${region}-aiplatform.googleapis.com/v1`;

  console.log("[Proxy] ", path);
  console.log("[Base Url]", baseUrl);

  const timeoutId = setTimeout(
    () => {
      controller.abort();
    },
    10 * 60 * 1000,
  );
  const fetchUrl = `${baseUrl}${path}${
    req?.nextUrl?.searchParams?.get("alt") === "sse" ? "?alt=sse" : ""
  }`;

  console.log("[Fetch Url] ", fetchUrl);
  const fetchOptions: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      Authorization: `Bearer ${apiKey}`,
    },
    method: req.method,
    body: req.body,
    redirect: "manual",
    // @ts-ignore
    duplex: "half",
    signal: controller.signal,
  };

  try {
    const res = await fetch(fetchUrl, fetchOptions);
    const newHeaders = new Headers(res.headers);
    newHeaders.delete("www-authenticate");
    newHeaders.set("X-Accel-Buffering", "no");

    return new Response(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers: newHeaders,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}
