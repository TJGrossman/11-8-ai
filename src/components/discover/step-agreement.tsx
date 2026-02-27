"use client";

import { useState } from "react";
import { useSession } from "@/lib/discovery-store";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  FileText,
  Handshake,
} from "lucide-react";
import { Logo } from "@/components/logo";

interface StepProps {
  onNext: () => void;
  onBack: () => void;
}

function generatePDF(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  session: any
) {
  import("jspdf").then(({ jsPDF }) => {
    const doc = new jsPDF();
    const margin = 20;
    let y = margin;

    const addLine = (text: string, fontSize = 11, bold = false) => {
      doc.setFontSize(fontSize);
      doc.setFont("helvetica", bold ? "bold" : "normal");
      const lines = doc.splitTextToSize(text, 170);
      if (y + lines.length * (fontSize * 0.5) > 275) {
        doc.addPage();
        y = margin;
      }
      doc.text(lines, margin, y);
      y += lines.length * (fontSize * 0.45) + 4;
    };

    const addSpace = (px = 6) => {
      y += px;
    };

    // Header
    addLine("11-8 AI — Discovery Agreement", 18, true);
    addSpace(4);
    addLine(
      `Prepared for: ${session.businessSnapshot.businessName}`,
      12,
      false
    );
    addLine(`Date: ${new Date().toLocaleDateString()}`, 11);
    addLine(`Session ID: ${session.id}`, 9);
    addSpace(8);

    // Business snapshot
    addLine("Business Overview", 14, true);
    addLine(`Industry: ${session.businessSnapshot.industry}`);
    addLine(`Team size: ${session.businessSnapshot.teamSize}`);
    if (
      session.businessSnapshot.revenueRange &&
      session.businessSnapshot.revenueRange !== "Prefer not to say"
    ) {
      addLine(`Revenue range: ${session.businessSnapshot.revenueRange}`);
    }
    addSpace(8);

    // What we'll build
    addLine("What We'll Build", 14, true);
    session.automationOpportunities.forEach(
      (opp: { title: string; description: string }, i: number) => {
        addLine(`${i + 1}. ${opp.title}`, 11, true);
        addLine(opp.description);
        addSpace(4);
      }
    );
    addSpace(4);

    // Success metrics
    addLine("Success Metrics", 14, true);
    session.agreement.metrics.forEach(
      (m: {
        name: string;
        description: string;
        dataSource: string;
        targetImprovement: string;
      }) => {
        addLine(`• ${m.name}`, 11, true);
        addLine(`  ${m.description}`);
        addLine(`  Data source: ${m.dataSource}`);
        addLine(`  Target: ${m.targetImprovement}`);
        addSpace(2);
      }
    );
    addSpace(4);

    // Terms
    addLine("Agreement Terms", 14, true);
    addLine(
      `Value-share: ${session.agreement.valueSharePercent}% of measurable value created`
    );
    addLine(`Baseline period: ${session.agreement.baselineDays} days`);
    addLine(`Measurement period: ${session.agreement.measurementDays} days`);
    addLine(
      `First invoice: Day ${session.agreement.baselineDays + session.agreement.measurementDays}`
    );
    addSpace(4);
    addLine(
      "If no measurable value is created, no payment is due. Either party may exit at any time."
    );
    addSpace(12);

    // Signatures
    addLine("Agreed By", 14, true);
    addSpace(4);
    addLine(`Client: ${session.agreement.clientName || "___________________"}`);
    addSpace(8);
    addLine("11-8 AI: ___________________");
    addSpace(8);
    addLine(`Date: ${new Date().toLocaleDateString()}`);

    doc.save(
      `11-8-AI-Agreement-${session.businessSnapshot.businessName.replace(/\s+/g, "-")}.pdf`
    );
  });
}

export function StepAgreement({ onBack }: StepProps) {
  const { session, dispatch } = useSession();
  const [agreed, setAgreed] = useState(!!session.agreement.agreedAt);

  const totalSavings = session.automationOpportunities.reduce(
    (sum, opp) => sum + opp.estimatedRevenuImpact,
    0
  );
  const ourShare = Math.round(
    totalSavings * (session.agreement.valueSharePercent / 100)
  );
  const theirShare = totalSavings - ourShare;

  const handleAgree = () => {
    dispatch({
      type: "UPDATE_AGREEMENT",
      data: { agreedAt: new Date().toISOString() },
    });
    setAgreed(true);
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {agreed ? "We're in this together" : "Does this feel like a good deal?"}
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          {agreed
            ? "Here's your agreement summary. Download a copy for your records."
            : "Review everything below. Adjust anything that doesn't feel right, then let's make it official."}
        </p>
      </div>

      {/* Agreement document */}
      <div className="mb-8 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        {/* Document header */}
        <div className="border-b border-border/40 bg-muted/30 px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-primary" />
              <div>
                <h2 className="font-semibold">Discovery Agreement</h2>
                <p className="text-sm text-muted-foreground">
                  {session.businessSnapshot.businessName} &times; 11-8 AI
                </p>
              </div>
            </div>
            <Logo className="text-lg" />
          </div>
        </div>

        <div className="divide-y divide-border/40 px-6">
          {/* What we'll build */}
          <div className="py-6">
            <h3 className="mb-4 text-sm font-medium uppercase tracking-wider text-muted-foreground">
              What we&apos;ll build
            </h3>
            <div className="space-y-3">
              {session.automationOpportunities.map((opp, i) => (
                <div key={opp.id} className="flex gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                    {i + 1}
                  </div>
                  <div>
                    <div className="font-medium">{opp.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {opp.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* What we'll measure */}
          <div className="py-6">
            <h3 className="mb-4 text-sm font-medium uppercase tracking-wider text-muted-foreground">
              What we&apos;ll measure
            </h3>
            <div className="space-y-3">
              {session.agreement.metrics.map((metric) => (
                <div
                  key={metric.id}
                  className="rounded-lg border border-border/40 bg-background p-3"
                >
                  <div className="font-medium">{metric.name}</div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {metric.description}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span>Source: {metric.dataSource}</span>
                    <span>Target: {metric.targetImprovement}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Value share */}
          <div className="py-6">
            <h3 className="mb-4 text-sm font-medium uppercase tracking-wider text-muted-foreground">
              How we&apos;ll share value
            </h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg bg-muted/50 p-4 text-center">
                <div className="text-sm text-muted-foreground">
                  Estimated annual savings
                </div>
                <div className="mt-1 text-2xl font-bold">
                  ${totalSavings.toLocaleString()}
                </div>
              </div>
              <div className="rounded-lg bg-primary/5 p-4 text-center">
                <div className="text-sm text-muted-foreground">
                  You keep ({100 - session.agreement.valueSharePercent}%)
                </div>
                <div className="mt-1 text-2xl font-bold text-primary">
                  ${theirShare.toLocaleString()}
                </div>
              </div>
              <div className="rounded-lg bg-muted/50 p-4 text-center">
                <div className="text-sm text-muted-foreground">
                  11-8 AI receives ({session.agreement.valueSharePercent}%)
                </div>
                <div className="mt-1 text-2xl font-bold">
                  ${ourShare.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="py-6">
            <h3 className="mb-4 text-sm font-medium uppercase tracking-wider text-muted-foreground">
              Timeline
            </h3>
            <div className="flex items-center gap-2 text-sm">
              <div className="rounded-md bg-muted px-3 py-1.5">
                Day 1-{session.agreement.baselineDays}: Baseline
              </div>
              <div className="text-muted-foreground">&rarr;</div>
              <div className="rounded-md bg-muted px-3 py-1.5">
                Build & Deploy
              </div>
              <div className="text-muted-foreground">&rarr;</div>
              <div className="rounded-md bg-muted px-3 py-1.5">
                {session.agreement.measurementDays}-day Measurement
              </div>
              <div className="text-muted-foreground">&rarr;</div>
              <div className="rounded-md bg-primary/10 px-3 py-1.5 text-primary">
                First Invoice
              </div>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              If no measurable value is created, no payment is due. Either party
              may exit at any time.
            </p>
          </div>

          {/* Client info + agree */}
          <div className="py-6">
            {!agreed ? (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Your name
                    </label>
                    <input
                      type="text"
                      value={session.agreement.clientName}
                      onChange={(e) =>
                        dispatch({
                          type: "UPDATE_AGREEMENT",
                          data: { clientName: e.target.value },
                        })
                      }
                      placeholder="Full name"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Your email
                    </label>
                    <input
                      type="email"
                      value={session.agreement.clientEmail}
                      onChange={(e) =>
                        dispatch({
                          type: "UPDATE_AGREEMENT",
                          data: { clientEmail: e.target.value },
                        })
                      }
                      placeholder="email@business.com"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
                <Button
                  size="lg"
                  onClick={handleAgree}
                  disabled={
                    !session.agreement.clientName.trim() ||
                    !session.agreement.clientEmail.trim()
                  }
                  className="w-full gap-2"
                >
                  <Handshake className="h-5 w-5" />
                  I agree — let&apos;s do this
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 py-4 text-center">
                <CheckCircle2 className="h-12 w-12 text-primary" />
                <div>
                  <h3 className="text-lg font-semibold">Agreement confirmed</h3>
                  <p className="text-sm text-muted-foreground">
                    Agreed by {session.agreement.clientName} on{" "}
                    {new Date(
                      session.agreement.agreedAt!
                    ).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => generatePDF(session)}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download PDF
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="ghost" size="lg" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        {!agreed && (
          <Button
            variant="outline"
            size="lg"
            onClick={() => generatePDF(session)}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Preview PDF
          </Button>
        )}
      </div>
    </div>
  );
}
