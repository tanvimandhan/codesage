import { processingMeeting } from "@/lib/assembly";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const bodyParser = z.object({
  meetingUrl: z.string(),
  projectId: z.string(),
  meetingId: z.string(),
});

export const maxDuration = 300;

export async function POST(req: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
  const body = await req.json();
  console.log("Request body:", body);

  const { meetingUrl, projectId, meetingId } = bodyParser.parse(body);
  console.log("Parsed body:", { meetingUrl, projectId, meetingId });

  const { summaries } = await processingMeeting(meetingUrl);
  console.log("Summaries received:", summaries);

  if (!summaries || summaries.length === 0) {
    console.warn("No summaries generated.");
    return NextResponse.json(
      { error: "No summaries generated." },
      { status: 400 }
    );
  }

  await db.issue.createMany({
    data: summaries.map((summary) => ({
      start: summary.start,
      end: summary.end,
      gist: summary.gist,
      headline: summary.headline,
      summary: summary.summary,
      projectId,
      meetingId,
    })),
  });
  console.log("Issues created.");

  await db.meeting.update({
    where: { id: meetingId },
    data: {
      status: "COMPLETED",
      name: summaries[0]?.headline || "Untitled Meeting",
    },
  });
  console.log("Meeting updated.");

  return NextResponse.json({ success: true });
} catch (error: any) {
  console.error("Processing meeting failed:", error);
  return NextResponse.json(
    { error: error.message || "Internal server error" },
    { status: 500 }
  );
}

}6
