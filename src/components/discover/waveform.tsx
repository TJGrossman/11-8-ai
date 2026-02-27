"use client";


type AgentState = "idle" | "listening" | "processing" | "speaking";

interface WaveformProps {
  state: AgentState;
}

export function Waveform({ state }: WaveformProps) {
  const bars = 28;

  return (
    <div className="flex items-center justify-center gap-1 h-16">
      {Array.from({ length: bars }).map((_, i) => {
        const isActive = state === "listening" || state === "speaking";
        const center = bars / 2;
        const distFromCenter = Math.abs(i - center) / center;
        const baseHeight = state === "processing"
          ? 4
          : isActive
          ? 8
          : 4;

        return (
          <div
            key={i}
            className="rounded-full transition-all"
            style={{
              width: "3px",
              backgroundColor:
                state === "idle"
                  ? "hsl(var(--border))"
                  : state === "processing"
                  ? "hsl(var(--muted-foreground))"
                  : "hsl(var(--primary))",
              height: `${baseHeight}px`,
              animation:
                isActive
                  ? `wave ${0.8 + distFromCenter * 0.4}s ease-in-out ${i * 0.04}s infinite alternate`
                  : "none",
              opacity: isActive ? 1 - distFromCenter * 0.3 : 0.4,
            }}
          />
        );
      })}

      <style jsx>{`
        @keyframes wave {
          from { height: ${state === "listening" ? "6px" : "4px"}; }
          to { height: ${state === "listening" ? "48px" : "56px"}; }
        }
      `}</style>
    </div>
  );
}
