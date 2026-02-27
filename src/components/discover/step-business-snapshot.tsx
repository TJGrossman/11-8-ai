"use client";

import { useSession } from "@/lib/discovery-store";
import { INDUSTRY_OPTIONS, TEAM_SIZE_OPTIONS, REVENUE_RANGE_OPTIONS } from "@/lib/discovery-types";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface StepProps {
  onNext: () => void;
  onBack: () => void;
}

export function StepBusinessSnapshot({ onNext }: StepProps) {
  const { session, dispatch } = useSession();
  const snap = session.businessSnapshot;

  const update = (data: Partial<typeof snap>) =>
    dispatch({ type: "UPDATE_SNAPSHOT", data });

  const isValid =
    snap.businessName.trim() !== "" &&
    snap.industry !== "" &&
    snap.teamSize !== "" &&
    snap.typicalDay.trim().length > 10;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Let&apos;s get to know your business
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          We&apos;ll start with the basics, then dig into where your time really goes.
        </p>
      </div>

      <div className="space-y-8">
        {/* Business Name */}
        <div>
          <label className="mb-2 block text-sm font-medium">
            What&apos;s your business called?
          </label>
          <input
            type="text"
            value={snap.businessName}
            onChange={(e) => update({ businessName: e.target.value })}
            placeholder="e.g. Coastal Property Management"
            className="w-full rounded-lg border border-input bg-background px-4 py-3 text-base transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Industry */}
        <div>
          <label className="mb-2 block text-sm font-medium">
            What industry are you in?
          </label>
          <div className="flex flex-wrap gap-2">
            {INDUSTRY_OPTIONS.map((opt) => (
              <button
                key={opt}
                onClick={() => update({ industry: opt })}
                className={`rounded-full border px-4 py-2 text-sm transition-all ${
                  snap.industry === opt
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Team Size */}
        <div>
          <label className="mb-2 block text-sm font-medium">
            How big is your team?
          </label>
          <div className="flex flex-wrap gap-2">
            {TEAM_SIZE_OPTIONS.map((opt) => (
              <button
                key={opt}
                onClick={() => update({ teamSize: opt })}
                className={`rounded-full border px-4 py-2 text-sm transition-all ${
                  snap.teamSize === opt
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Revenue Range */}
        <div>
          <label className="mb-2 block text-sm font-medium">
            Approximate annual revenue{" "}
            <span className="text-muted-foreground">(optional — helps us estimate impact)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {REVENUE_RANGE_OPTIONS.map((opt) => (
              <button
                key={opt}
                onClick={() => update({ revenueRange: opt })}
                className={`rounded-full border px-4 py-2 text-sm transition-all ${
                  snap.revenueRange === opt
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Typical Day */}
        <div>
          <label className="mb-2 block text-sm font-medium">
            Walk us through a typical day for you and your team
          </label>
          <p className="mb-3 text-sm text-muted-foreground">
            What does the first hour look like? Where do things pile up? What falls through the cracks?
          </p>
          <textarea
            value={snap.typicalDay}
            onChange={(e) => update({ typicalDay: e.target.value })}
            placeholder="e.g. I usually start the day checking emails and responding to tenant requests. By mid-morning I'm behind on returning calls from prospective tenants..."
            rows={5}
            className="w-full rounded-lg border border-input bg-background px-4 py-3 text-base transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      <div className="mt-10 flex justify-end">
        <Button size="lg" onClick={onNext} disabled={!isValid} className="gap-2">
          Continue to Pain Points
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
