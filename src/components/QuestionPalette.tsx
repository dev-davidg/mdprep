export interface PaletteItem {
  index: number;            // 0-based
  answered: boolean;
  flagged: boolean;
}

export default function QuestionPalette({ items, goto }: { items: PaletteItem[]; goto: (index: number) => void; }) {
  return (
    <div className="grid grid-cols-10 gap-1 md:grid-cols-12" aria-label="Question navigation">
      {items.map((it) => (
        <button
          key={it.index}
          onClick={() => goto(it.index)}
          className={[
            "h-9 w-9 rounded border text-sm",
            it.answered ? "bg-primary text-primary-foreground" : "bg-muted",
            it.flagged ? "ring-2 ring-yellow-500" : ""
          ].join(" ")}
          aria-label={`Question ${it.index + 1}${it.flagged ? ", flagged" : ""}${it.answered ? ", answered" : ", unanswered"}`}
        >
          {it.index + 1}
        </button>
      ))}
    </div>
  );
}
