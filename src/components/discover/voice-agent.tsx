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

  // Refs — always current, safe to use inside event handlers / callbacks
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const agentStateRef = useRef<AgentState>("idle"); // mirrors agentState for callbacks
  const isSpeakingRef = useRef(false);
  const pendingUserTextRef = useRef("");
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const messagesRef = useRef<ChatMessage[]>([]); // mirrors messages for callbacks
  const mutedRef = useRef(false);

  // Keep refs in sync with state
  useEffect(() => { agentStateRef.current = agentState; }, [agentState]);
  useEffect(() => { messagesRef.current = messages; }, [messages]);
  useEffect(() => { mutedRef.current = muted; }, [muted]);

  const setState = useCallback((s: AgentState) => {
    agentStateRef.current = s;
    setAgentState(s);
  }, []);

  // Check browser support
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    if (!w.SpeechRecognition && !w.webkitSpeechRecognition) {
      setBrowserSupported(false);
    }
  }, []);

  // Auto-scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript, interimText]);

  // Persist session
  useEffect(() => {
    if (transcript.length > 0) {
      localStorage.setItem(
        `voice-session-${sessionId}`,
        JSON.stringify({ transcript, messages, insights })
      );
    }
  }, [transcript, messages, insights, sessionId]);

  // Forward-declared ref so callAgent and startListening can reference each other
  const startListeningRef = useRef<() => void>(() => {});
  const callAgentRef = useRef<(userText: string, msgs: ChatMessage[]) => void>(() => {});

  const speakFallback = useCallback((text: string, onEnd?: () => void) => {
    const synth = window.speechSynthesis;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.88;
    utterance.pitch = 1.0;

    const voices = synth.getVoices();
    const enVoices = voices.filter(v => v.lang.startsWith("en"));

    // Priority order — best sounding macOS/Chrome voices first
    const priority = [
      "Ava (Enhanced)",
      "Allison (Enhanced)",
      "Samantha (Enhanced)",
      "Susan (Enhanced)",
      "Victoria (Enhanced)",
      "Ava",
      "Allison",
      "Samantha",
      "Google US English",
      "Google UK English Female",
    ];

    let chosen: SpeechSynthesisVoice | undefined;
    for (const name of priority) {
      chosen = enVoices.find(v => v.name === name);
      if (chosen) break;
    }
    // Fallback: any local en-US voice
    if (!chosen) chosen = enVoices.find(v => v.lang === "en-US" && v.localService);
    if (!chosen) chosen = enVoices.find(v => v.lang === "en-US");
    if (chosen) utterance.voice = chosen;

    console.log("Using voice:", chosen?.name ?? "browser default");

    utterance.onend = () => { isSpeakingRef.current = false; onEnd?.(); };
    utterance.onerror = () => { isSpeakingRef.current = false; onEnd?.(); };
    synth.speak(utterance);
  }, []);

  const speak = useCallback(async (text: string, onEnd?: () => void) => {
    isSpeakingRef.current = true;
    setState("speaking");

    if (mutedRef.current) {
      isSpeakingRef.current = false;
      setTimeout(() => onEnd?.(), 300);
      return;
    }

    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) throw new Error("TTS failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      currentAudioRef.current = audio;

      audio.onended = () => {
        URL.revokeObjectURL(url);
        currentAudioRef.current = null;
        isSpeakingRef.current = false;
        onEnd?.();
      };
      audio.onerror = () => {
        URL.revokeObjectURL(url);
        currentAudioRef.current = null;
        isSpeakingRef.current = false;
        onEnd?.();
      };

      await audio.play();
    } catch (err) {
      console.warn("ElevenLabs TTS failed, using browser fallback:", err);
      speakFallback(text, onEnd);
    }
  }, [setState, speakFallback]);

  // Main agent call — uses refs to avoid stale closures
  const callAgent = useCallback(
    async (userText: string, currentMessages: ChatMessage[]) => {
      setState("processing");

      const newMessages: ChatMessage[] = userText
        ? [...currentMessages, { role: "user", content: userText }]
        : currentMessages;

      if (userText) {
        setMessages(newMessages);
        messagesRef.current = newMessages;
        setTranscript((prev) => [
          ...prev,
          { role: "client", text: userText, timestamp: new Date() },
        ]);
      }

      try {
        const res = await fetch("/api/discover/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: newMessages, businessName, notes }),
        });

        const data = await res.json();
        if (!data.message) throw new Error("No message");

        const agentMessage = data.message as string;
        const newInsights = data.insights as InsightData;

        setInsights(newInsights);

        const updatedMessages: ChatMessage[] = [
          ...newMessages,
          { role: "assistant", content: agentMessage },
        ];
        setMessages(updatedMessages);
        messagesRef.current = updatedMessages;

        setTranscript((prev) => [
          ...prev,
          { role: "agent", text: agentMessage, timestamp: new Date() },
        ]);

        speak(agentMessage, () => {
          if (!newInsights.agreedToTerms) {
            // Small delay to let browser audio context settle
            setTimeout(() => startListeningRef.current(), 400);
          } else {
            setState("idle");
          }
        });
      } catch (err) {
        console.error("Agent error:", err);
        setTimeout(() => startListeningRef.current(), 400);
      }
    },
    [businessName, notes, speak, setState]
  );

  // Keep callAgentRef current
  useEffect(() => { callAgentRef.current = callAgent; }, [callAgent]);

  const startListening = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    const SpeechRecognition = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    if (isSpeakingRef.current) return;

    // Stop any existing recognition cleanly
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch { /* ignore */ }
      recognitionRef.current = null;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.maxAlternatives = 1;

    setState("listening");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      if (isSpeakingRef.current) return;

      let interim = "";
      let finalText = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalText += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }

      if (interim) setInterimText(interim);

      if (finalText) {
        pendingUserTextRef.current += " " + finalText;
        setInterimText("");

        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(() => {
          const userText = pendingUserTextRef.current.trim();
          pendingUserTextRef.current = "";
          if (userText) {
            // Set state BEFORE abort so onend doesn't restart listening
            agentStateRef.current = "processing";
            setAgentState("processing");
            try { recognition.abort(); } catch { /* ignore */ }
            recognitionRef.current = null;
            callAgentRef.current(userText, messagesRef.current);
          }
        }, 1500);
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      if (event.error === "aborted") return; // we triggered this, ignore
      console.warn("Speech recognition error:", event.error);
      // On no-speech or other errors, restart after a beat
      recognitionRef.current = null;
      if (!isSpeakingRef.current && agentStateRef.current === "listening") {
        setTimeout(() => startListeningRef.current(), 500);
      }
    };

    recognition.onend = () => {
      // Chrome stops continuous recognition periodically — restart if still listening
      if (!isSpeakingRef.current && agentStateRef.current === "listening") {
        setTimeout(() => startListeningRef.current(), 300);
      }
    };

    try {
      recognition.start();
    } catch (e) {
      console.warn("Recognition start error:", e);
    }
  }, [setState]);

  // Keep startListeningRef current
  useEffect(() => { startListeningRef.current = startListening; }, [startListening]);

  const handleStart = useCallback(() => {
    setStarted(true);
    callAgentRef.current("", []);
  }, []);

  const handleReset = useCallback(() => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch { /* ignore */ }
      recognitionRef.current = null;
    }
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    setTranscript([]);
    setMessages([]);
    messagesRef.current = [];
    setInsights(DEFAULT_INSIGHTS);
    setState("idle");
    setStarted(false);
    isSpeakingRef.current = false;
    pendingUserTextRef.current = "";
    localStorage.removeItem(`voice-session-${sessionId}`);
  }, [setState, sessionId]);

  const toggleMute = useCallback(() => {
    const next = !mutedRef.current;
    mutedRef.current = next;
    setMuted(next);
    if (next && currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
  }, []);

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
              <Button variant="ghost" size="icon" onClick={toggleMute} title={muted ? "Unmute agent" : "Mute agent"}>
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
        <div className="flex flex-1 overflow-hidden">
          {/* Left: transcript */}
          <div className="flex w-full flex-col lg:w-1/3">
            <div className="flex flex-col items-center gap-3 border-b border-border/40 bg-muted/20 px-4 py-6">
              <Waveform state={agentState} />
              <AnimatePresence mode="wait">
                <motion.span
                  key={agentState}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className={`text-sm font-medium ${
                    agentState === "listening" ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {STATE_LABELS[agentState]}
                </motion.span>
              </AnimatePresence>
            </div>

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

              {interimText && (
                <div className="flex justify-end">
                  <div className="max-w-[85%] rounded-2xl rounded-tr-sm border border-border/40 bg-muted/50 px-4 py-3 text-sm italic text-muted-foreground">
                    {interimText}
                  </div>
                </div>
              )}

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

          {/* Right: insights */}
          <div className="hidden lg:flex w-2/3 flex-col border-l border-border/40 bg-muted/10 p-4 overflow-y-auto">
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
