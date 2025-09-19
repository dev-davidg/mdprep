import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Shell from "@/layouts/Shell";
import { getQuestions, type Question, letterFromIndex } from "@/lib/data";
import { supabase } from "@/lib/supabase";

type ImgRef = { url: string; alt?: string };
type LongExploded = { text: string; images: ImgRef[] };

function useQS() {
  const q = new URLSearchParams(useLocation().search);
  const count = Math.max(1, Number(q.get("count") || "10"));
  const idx = Math.max(1, Number(q.get("q") || "1"));
  const category = q.get("category") || "";
  return { count, idx, category };
}

function splitLongExplanation(src?: string): LongExploded {
  if (!src) return { text: "", images: [] };
  const lines = src.split(/\r?\n/);
  const images: ImgRef[] = [];
  const kept: string[] = [];
  for (const raw of lines) {
    const line = raw.trim();
    const m = /^IMG:\s*(\S+)(?:\s*\|\s*(.+))?$/i.exec(line);
    if (m) images.push({ url: m[1], alt: m[2] });
    else kept.push(raw);
  }
  return { text: kept.join("\n").trim(), images };
}

function resolvePublicUrl(path: string): string {
  if (/^https?:\/\//i.test(path) || path.startsWith("/")) return path; // local /media or absolute URL
  const { data } = supabase.storage.from("mdprep-public").getPublicUrl(path);
  return data.publicUrl;
}

export default function Learning() {
  const { count, idx: initialIdx, category } = useQS();

  const [idx, setIdx] = useState(initialIdx);
  const [items, setItems] = useState<Question[]>([]);
  const [selected, setSelected] = useState<Record<number, string>>({});
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [flags, setFlags] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!category) return;
    getQuestions(category, count).then(setItems).catch(console.error);
  }, [category, count]);

  const goto = (n: number) => {
    const clamped = Math.max(1, Math.min(count, n));
    setIdx(clamped);
    const u = new URL(location.href);
    u.searchParams.set("q", String(clamped));
    history.replaceState(null, "", u.toString());
  };
  const prev = () => goto(idx - 1);
  const next = () => goto(idx + 1);

  const current = items[idx - 1];
  const picked = selected[idx];
  const showReveal = !!picked;

  const pick = (label: string) => {
    setSelected((s) => ({ ...s, [idx]: label }));
    setExpanded((e) => ({ ...e, [idx]: true }));
  };

  const toggleFlag = () => {
    setFlags((f) => {
      const nf = new Set(f);
      nf.has(idx) ? nf.delete(idx) : nf.add(idx);
      return nf;
    });
  };

  const long = splitLongExplanation(current?.explanation_long || "");

  return (
    <Shell title="Učiaci režim" rightLink={{ to: "/mode", label: "Späť na výber" }}>
      <section className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="text-sm text-gray-700">
            <span className="font-semibold">Otázka</span> {idx}/{count}
          </div>
          <button
            onClick={toggleFlag}
            className={`rounded-full border text-xs font-bold px-3 py-1.5 ${
              flags.has(idx)
                ? "bg-amber-50 text-amber-700 border-amber-300"
                : "bg-blue-50 text-blue-700 border-gray-200 hover:bg-blue-100"
            }`}
          >
            {flags.has(idx) ? "Označené" : "Označiť"}
          </button>
        </div>

        <div className="mt-4">
          <h2 className="text-base font-bold text-gray-900">
            {current ? current.text : "Načítavam..."}
          </h2>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-2">
          {current?.answers.map((o) => {
            const label = letterFromIndex(o.order_index);
            const isCorrect = o.is_correct === true;
            const revealCorrect = showReveal && isCorrect;
            const pickedWrongButThis = showReveal && picked === label && !isCorrect;

            return (
              <button
                key={o.id}
                onClick={() => pick(label)}
                className={[
                  "rounded-xl border text-left px-4 py-3 transition",
                  "bg-white border-gray-200 hover:bg-gray-50",
                  revealCorrect ? "bg-green-50 border-green-400 ring-2 ring-green-300" : "",
                  pickedWrongButThis ? "ring-2 ring-blue-300" : "",
                ]
                  .join(" ")
                  .trim()}
              >
                <span className="font-bold mr-2">{label})</span>
                {o.text}
              </button>
            );
          })}
        </div>

        <div className="mt-4 space-y-3">
          <details
            open={!!expanded[idx]}
            onToggle={(e) =>
              setExpanded((ex) => ({ ...ex, [idx]: (e.target as HTMLDetailsElement).open }))
            }
            className="rounded-xl border border-gray-200 bg-white p-3"
          >
            <summary className="cursor-pointer select-none text-sm font-semibold text-gray-900">
              Vysvetlenie
            </summary>
            <div className="mt-2 text-sm text-gray-700">
              {showReveal ? (
                <>
                  <p>{current?.explanation || "Bez vysvetlenia."}</p>
                  {long.text && (
                    <div className="mt-3 border-t border-gray-200 pt-3">
                      <p className="text-sm font-semibold text-gray-900 mb-1">Podrobnejšie vysvetlenie</p>
                      <p className="text-sm text-gray-700 whitespace-pre-line">{long.text}</p>
                    </div>
                  )}
                  {long.images.length > 0 && (
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {long.images.map((img, i) => (
                        <figure
                          key={img.url + i}
                          className="rounded-lg border border-gray-200 bg-white overflow-hidden"
                        >
                          {/* Fixed-height flex box centers image perfectly */}
                          <div className="h-60 w-full flex items-center justify-center p-3">
                            <img
                              src={resolvePublicUrl(img.url)}
                              alt={img.alt ?? ""}
                              className="max-h-full max-w-full object-contain"
                            />
                          </div>
                          {img.alt && (
                            <figcaption className="px-3 py-2 text-xs text-gray-600 text-center">
                              {img.alt}
                            </figcaption>
                          )}
                        </figure>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                "Zobrazí sa po zodpovedaní otázky."
              )}
            </div>
          </details>

          <details className="rounded-xl border border-gray-200 bg-white p-3">
            <summary className="cursor-pointer select-none text-sm font-semibold text-gray-900">
              Komentáre (čoskoro)
            </summary>
            <div className="mt-2 text-sm text-gray-600">Funkcia bude dostupná neskôr.</div>
          </details>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <button
            onClick={prev}
            disabled={idx === 1}
            className={`rounded-full text-sm font-bold px-5 py-2 ${
              idx === 1
                ? "bg-blue-50 text-blue-700/60 cursor-not-allowed"
                : "bg-blue-50 text-blue-700 hover:bg-blue-100"
            }`}
          >
            Predošlá
          </button>
          <button
            className="rounded-full bg-blue-500 text-white text-sm font-bold px-5 py-2 hover:bg-blue-600"
            onClick={next}
          >
            Ďalej
          </button>
        </div>
      </section>
    </Shell>
  );
}
