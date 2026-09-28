import { NextRequest, NextResponse } from "next/server";
import { getLeadById } from "@/lib/supabase/server";

const DEFAULT_N8N_WEBHOOK_URL =
  "https://consoling-clinking-cornfield.ngrok-free.dev/webhook/lead-enrich";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const checkDomain = searchParams.get("checkDomain");

  if (!checkDomain) {
    return NextResponse.json({ exists: false, lead: null });
  }

  try {
    const lead = await getLeadById(checkDomain);
    if (lead) {
      return NextResponse.json({ exists: true, lead });
    }
    return NextResponse.json({ exists: false, lead: null });
  } catch {
    return NextResponse.json({ exists: false, lead: null });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { website, icp } = body || {};

    if (!website || typeof website !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "A valid company website URL is required.",
        },
        { status: 400 }
      );
    }

    const targetUrl = process.env.N8N_WEBHOOK_URL || DEFAULT_N8N_WEBHOOK_URL;

    // Set up a 180-second timeout controller for long-running Qwen 7B model execution
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 180000);

    try {
      const response = await fetch(targetUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          website: website.trim(),
          icp: icp || {
            industries: [],
            companySizes: [],
            locations: [],
            businessModels: [],
            technologies: [],
          },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorMessage = `n8n webhook responded with status ${response.status}`;
        if (response.status === 404) {
          errorMessage = "The lead enrichment webhook endpoint was not found.";
        } else if (response.status >= 500) {
          errorMessage = "The lead enrichment backend encountered an internal error.";
        }
        return NextResponse.json(
          {
            success: false,
            error: errorMessage,
          },
          { status: response.status }
        );
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.warn("n8n non-json response snippet:", text.substring(0, 100));
        return NextResponse.json(
          {
            success: false,
            error: "Received invalid data format from enrichment service.",
          },
          { status: 502 }
        );
      }

      const data = await response.json();
      return NextResponse.json(data);
    } catch (fetchErr: any) {
      clearTimeout(timeoutId);

      if (fetchErr.name === "AbortError") {
        return NextResponse.json(
          {
            success: false,
            error: "The lead enrichment process timed out. Local AI processing requires more time. Please try again.",
          },
          { status: 504 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: "Unable to connect to the lead enrichment webhook service. Please check network connectivity.",
        },
        { status: 503 }
      );
    }
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: "Malformed request payload provided to server API.",
      },
      { status: 400 }
    );
  }
}

