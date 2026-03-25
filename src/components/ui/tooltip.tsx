"use client";

import { useState, useRef, useEffect } from "react";

interface TooltipProps {
  content: string;
  children?: React.ReactNode;
  /** If true, renders a default "?" trigger button */
  showTrigger?: boolean;
}

export function Tooltip({ content, children, showTrigger = false }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!visible) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setVisible(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [visible]);

  return (
    <div ref={ref} className="relative inline-flex items-center">
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        className="focus-ring inline-flex items-center justify-center"
        aria-label={content}
      >
        {children ?? (
          showTrigger && (
            <span className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full border border-velvet-600 text-[10px] font-bold text-velvet-400 hover:border-gold-500/60 hover:text-gold-400 transition-colors cursor-help">
              ?
            </span>
          )
        )}
      </button>
      {visible && (
        <div
          role="tooltip"
          className="absolute bottom-full left-1/2 z-50 mb-2 w-max max-w-[220px] -translate-x-1/2 rounded-lg border border-velvet-600 bg-velvet-900 px-3 py-2 text-xs text-velvet-200 shadow-xl"
        >
          {content}
          <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-velvet-600" />
        </div>
      )}
    </div>
  );
}

/** Standalone ? icon that shows a tooltip */
export function StatTooltip({ content }: { content: string }) {
  return (
    <Tooltip content={content} showTrigger>
      <span className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full border border-velvet-600 text-[10px] font-bold text-velvet-400 hover:border-gold-500/60 hover:text-gold-400 transition-colors cursor-help">
        ?
      </span>
    </Tooltip>
  );
}
