"use client";

import { useParams, useSearchParams } from "next/navigation";
import { VoiceAgent } from "@/components/discover/voice-agent";
import { Suspense } from "react";

function DiscoverSessionInner() {
  const params = useParams();
  const searchParams = useSearchParams();
  const sessionId = params.sessionId as string;
  const businessName = searchParams.get("businessName") || "Discovery Session";
  const notes = searchParams.get("notes") || undefined;

  return (
    <VoiceAgent
      sessionId={sessionId}
      businessName={businessName}
      notes={notes}
    />
  );
}

export default function DiscoverSession() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    }>
      <DiscoverSessionInner />
    </Suspense>
  );
}
