"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { INDUSTRY_OPTIONS } from "@/lib/discovery-types";
import { ArrowRight, ChevronDown } from "lucide-react";

export default function DiscoverIndex() {
  const router = useRouter();
  const [businessName, setBusinessName] = useState("");
  const [industry, setIndustry] = useState("");
  const [notes, setNotes] = useState("");

  const handleStart = () => {
    if (!businessName.trim()) return;
    const sessionId = uuidv4();
    const params = new URLSearchParams({
      businessName: businessName.trim(),
      ...(industry && { industry }),
      ...(notes.trim() && { notes: notes.trim() }),
    });
    router.push(`/discover/${sessionId}?${params.toString()}`);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background dark">
      <div className="border-b border-border/40 bg-background/90 backdrop-blur-lg">
        <div className="mx-auto flex h-14 max-w-6xl items-center px-4">
          <Logo className="text-lg" />
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight">
              New discovery session
            </h1>
            <p className="mt-3 text-muted-foreground">
              Fill in what you know before the meeting. The AI agent handles the rest.
            </p>
          </div>

          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Business name <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleStart()}
                placeholder="e.g. Coastal Property Group"
                autoFocus
                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-base transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Industry{" "}
                <span className="text-muted-foreground">(optional)</span>
              </label>
              <div className="relative">
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full appearance-none rounded-lg border border-input bg-background px-4 py-3 text-base transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Select industry...</option>
                  {INDUSTRY_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Pre-session notes{" "}
                <span className="text-muted-foreground">(optional)</span>
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Property manager, ~200 units, warm intro from John. Main frustration: tenant communication volume."
                rows={3}
                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <p className="mt-1.5 text-xs text-muted-foreground">
                Private — shared with the agent but not shown to the client.
              </p>
            </div>

            <Button
              size="lg"
              className="w-full gap-2"
              disabled={!businessName.trim()}
              onClick={handleStart}
            >
              Start Session
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
