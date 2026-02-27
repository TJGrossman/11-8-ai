"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Waveform } from "./waveform";
import { InsightsPanel } from "./insights-panel";
import { Logo } from "@/components/logo";
import type { ChatMessage, InsightData } from "@/app/api/discover/chat/route";
import { Mic, MicOff, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

type AgentState = "idle" | "listening" | "processing" | "speaking";

interface TranscriptEntry {
  role: "agent" | "client";
  text: string;
  timestamp: Date;
}

interface VoiceAgentProps {
  businessName: string;
  notes?: string;
  sessionId: string;
}

const STATE_LABELS: Record<AgentState, string> = {
  idle: "Ready",
  listening: "Listening...",
  processing: "Thinking...",
  speaking: "Speaking...",
};

const DEFAULT_INSIGHTS: InsightData = {
  stage: "intro",
  painPoints: [],
  estimatedAnnualCost: 0,
  automationSuggestions: [],
  valueSharePercent: 12,
  readyForAgreement: false,
  agreedToTerms: false,
};

export function VoiceAgent({ businessName, notes, sessionId }: VoiceAgentProps) {
  const [agentState, setAgentState] = useState<AgentState>("idle");
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [insights, setInsights] = useState<InsightData>(DEFAULT_INSIGHTS);
  const [interimText, setInterimText] = useState("");
  const [started, setStarted] = useState(false);
  const [muted, setMuted] = useState(false);
  const [browserSupported, setBrowserSupported] = useState(true);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const isSpeakingRef = useRef(false);
  const pendingUserTextRef = useRef("");
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Check browser support
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) {
      setBrowserSupported(false);
    }
    synthRef.current = window.speechSynthesis;
  }, []);

  // Auto-scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript, interimText]);

  // Persist session to localStorage
  useEffect(() => {
    if (transcript.length > 0) {
      localStorage.setItem(
        `voice-session-${sessionId}`,
        JSON.stringify({ transcript, messages, insights })
      );
    }
  }, [transcript, messages, insights, sessionId]);

  const speak = useCallback((text: string, onEnd?: () => void) => {
    if (!synthRef.current || muted) {
      onEnd?.();
      return;
    }
    synthRef.current.cancel();
    isSpeakingRef.current = true;
    setAgentState("speaking");

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.92;
    utterance.pitch = 1.0;

    // Prefer a natural-sounding voice
    const voices = synthRef.current.getVoices();
    const preferred = voices.find(
      (v) =>
        v.name.includes("Samantha") ||
        v.name.includes("Karen") ||
        v.name.includes("Google US English") ||
        v.name.includes("en-US")
    );
    if (preferred) utterance.voice = preferred;

    utterance.onend = () => {
      isSpeakingRef.current = false;
      onEnd?.();
    };
    utterance.onerror = () => {
      isSpeakingRef.current = false;
      onEnd?.();
    };

    synthRef.current.speak(utterance);
  }, [muted]);

  const callAgent = useCallback(
    async (userText: string, currentMessages: ChatMessage[]) => {
      setAgentState("processing");

      const newMessages: ChatMessage[] = userText
        ? [...currentMessages, { role: "user", content: userText }]
        : currentMessages;

      if (userText) {
        setMessages(newMessages);
        setTranscript((prev) => [
          ...prev,
          { role: "client", text: userText, timestamp: new Date() },
        ]);
      }

      try {
        const res = await fetch("/api/discover/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: newMessages,
            businessName,
            notes,
          }),
        });

        const data = await res.json();
        if (!data.message) throw new Error("No message in response");

        const agentMessage = data.message as string;
        const newInsights = data.insights as InsightData;

        setInsights(newInsights);

        const updatedMessages: ChatMessage[] = [
          ...newMessages,
          { role: "assistant", content: agentMessage },
        ];
        setMessages(updatedMessages);
        setTranscript((prev) => [
          ...prev,
          { role: "agent", text: agentMessage, timestamp: new Date() },
        ]);

        speak(agentMessage, () => {
          if (!newInsights.agreedToTerms) {
            startListening();
          } else {
            setAgentState("idle");
          }
        });
      } catch (err) {
        console.error("Agent error:", err);
        setAgentState("listening");
        startListening();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [businessName, notes, speak]
  );

  const startListening = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    const SpeechRecognition = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    // Don't start if agent is speaking
    if (isSpeakingRef.current) return;

    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch { /* ignore */ }
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    setAgentState("listening");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      let interim = "";
      let final = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }

      if (interim) setInterimText(interim);

      if (final) {
        pendingUserTextRef.current += " " + final;
        setInterimText("");

        // Reset silence timer — send after 1.5s of silence
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(() => {
          const userText = pendingUserTextRef.current.trim();
          pendingUserTextRef.current = "";
          if (userText) {
            recognition.stop();
            setMessages((prev) => {
              callAgent(userText, prev);
              return prev;
            });
          }
        }, 1500);
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      if (event.error === "no-speech") {
        // Restart silently
        recognition.stop();
        setTimeout(startListening, 300);
      }
    };

    recognition.onend = () => {
      // Only restart if we're still supposed to be listening
      if (agentState === "listening" && !isSpeakingRef.current) {
        setTimeout(startListening, 300);
      }
    };

    recognition.start();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callAgent]);

  const handleStart = useCallback(() => {
    setStarted(true);
    // Kick off the conversation with empty user message (agent speaks first)
    callAgent("", []);
  }, [callAgent]);

  const handleReset = () => {
    synthRef.current?.cancel();
    recognitionRef.current?.stop();
    setTranscript([]);
    setMessages([]);
    setInsights(DEFAULT_INSIGHTS);
    setAgentState("idle");
    setStarted(false);
    isSpeakingRef.current = false;
    pendingUserTextRef.current = "";
    localStorage.removeItem(`voice-session-${sessionId}`);
  };

  const toggleMute = () => {
    if (!muted) {
      synthRef.current?.cancel();
    }
    setMuted((m) => !m);
  };

  if (!browserSupported) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-8 text-center">
        <div className="text-lg font-semibold">Browser not supported</div>
        <p className="max-w-sm text-muted-foreground">
          Voice features require Chrome or Edge. Please open this session in Chrome for the full experience.
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background dark">
      {/* Top bar */}
      <div className="border-b border-border/40 bg-background/90 backdrop-blur-lg">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Logo className="text-lg" />
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-muted-foreground">
              {businessName}
            </span>
            {started && (
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                <span className="text-xs font-medium text-red-500">LIVE</span>
              </div>
            )}
            {started && (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMute}
                title={muted ? "Unmute agent" : "Mute agent"}
              >
                {muted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
            )}
            {started && (
              <Button variant="ghost" size="icon" onClick={handleReset} title="Reset session">
                <RotateCcw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {!started ? (
        /* Pre-start screen */
        <div className="flex flex-1 flex-col items-center justify-center gap-8 px-4">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to meet {businessName}?
            </h1>
            <p className="mt-4 max-w-md text-lg text-muted-foreground">
              The AI agent will conduct the discovery conversation. Hand over the
              device after you start — or share your screen and let it run.
            </p>
          </div>
          <div className="flex flex-col items-center gap-4">
            <Button size="lg" onClick={handleStart} className="gap-3 px-8 py-6 text-lg">
              <span className="h-3 w-3 animate-pulse rounded-full bg-current" />
              Start Discovery Session
            </Button>
            <p className="text-sm text-muted-foreground">
              Requires microphone access &middot; Chrome or Edge recommended
            </p>
          </div>
        </div>
      ) : (
        /* Live session */
        <div className="flex flex-1 overflow-hidden">
          {/* Left: transcript */}
          <div className="flex w-full flex-col lg:w-3/5">
            {/* Waveform + status */}
            <div className="flex flex-col items-center gap-3 border-b border-border/40 bg-muted/20 px-4 py-6">
              <Waveform state={agentState} />
              <div className="flex items-center gap-2">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={agentState}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className={`text-sm font-medium ${
                      agentState === "listening"
                        ? "text-primary"
                        : agentState === "speaking"
                        ? "text-foreground"
                        : agentState === "processing"
                        ? "text-muted-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {STATE_LABELS[agentState]}
                  </motion.span>
                </AnimatePresence>
              </div>
            </div>

            {/* Transcript scroll */}
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
              <AnimatePresence initial={false}>
                {transcript.map((entry, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${entry.role === "agent" ? "justify-start" : "justify-end"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        entry.role === "agent"
                          ? "rounded-tl-sm bg-card border border-border/40 text-foreground"
                          : "rounded-tr-sm bg-primary text-primary-foreground"
                      }`}
                    >
                      {entry.text}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Interim text */}
              {interimText && (
                <div className="flex justify-end">
                  <div className="max-w-[85%] rounded-2xl rounded-tr-sm border border-border/40 bg-muted/50 px-4 py-3 text-sm italic text-muted-foreground">
                    {interimText}
                  </div>
                </div>
              )}

              {/* Processing indicator */}
              {agentState === "processing" && (
                <div className="flex justify-start">
                  <div className="flex gap-1 rounded-2xl rounded-tl-sm border border-border/40 bg-card px-4 py-3">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div ref={transcriptEndRef} />
            </div>
          </div>

          {/* Right: insights panel */}
          <div className="hidden lg:flex w-2/5 flex-col border-l border-border/40 bg-muted/10 p-4 overflow-y-auto">
            <div className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Live discoveries
            </div>
            <InsightsPanel insights={insights} businessName={businessName} />
          </div>
        </div>
      )}
    </div>
  );
}
