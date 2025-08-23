import { useEffect, useRef, useState } from "react";

export default function Timer({ durationMs = 90000, onExpire }: { durationMs?: number; onExpire: () => void; }) {
  const [remaining, setRemaining] = useState(durationMs);
  const startRef = useRef<number | null>(null);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    function tick(ts: number) {
      if (startRef.current == null) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const left = Math.max(0, durationMs - elapsed);
      setRemaining(left);
      if (left === 0) onExpire();
      else raf.current = requestAnimationFrame(tick);
    }
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [durationMs, onExpire]);

  const sec = Math.ceil(remaining / 1000);
  return (
    <div role="timer" aria-live="polite" className="text-sm text-muted-foreground">
      Time left: <span className={sec <= 10 ? "font-semibold" : ""}>{sec}s</span>
    </div>
  );
}
