"use client";

import { useEffect, useState } from "react";

interface NightTimerProps {
  startedAt: Date;
  label: string;
}

function formatElapsed(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => String(n).padStart(2, "0");

  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
}

export function NightTimer({ startedAt, label }: NightTimerProps) {
  const [elapsed, setElapsed] = useState(() => Date.now() - startedAt.getTime());

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Date.now() - startedAt.getTime());
    }, 1000);
    return () => clearInterval(interval);
  }, [startedAt]);

  return (
    <div className="flex flex-col items-center">
      <p className="text-xs text-velvet-400">{label}</p>
      <p className="text-xl font-bold tabular-nums text-gold-400 font-mono">
        {formatElapsed(elapsed)}
      </p>
    </div>
  );
}
