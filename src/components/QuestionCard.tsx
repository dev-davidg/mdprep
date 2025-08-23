import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import React from "react";

export interface Choice { id: string; body: string; }
export interface QuestionProps {
  stem: string;
  choices: Choice[];
  selectedId?: string | null;
  disabled?: boolean;
  onSelect?: (choiceId: string) => void;
  onSubmit?: () => void;
  children?: React.ReactNode; // explanation / extras
}

export default function QuestionCard({
  stem,
  choices,
  selectedId = null,
  disabled = false,
  onSelect,
  onSubmit,
  children
}: QuestionProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">{stem}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2" aria-label="Answer options">
          {choices.length === 0 ? (
            <p className="text-sm text-muted-foreground">No options available for this question.</p>
          ) : (
            choices.map((c) => (
              <Button
                key={c.id}
                type="button"
                variant={selectedId === c.id ? "default" : "outline"}
                size="md"
                disabled={disabled}
                onClick={() => onSelect?.(c.id)}
                className={selectedId === c.id ? "ring-2 ring-offset-2 ring-blue-600" : ""}
                aria-pressed={selectedId === c.id}
              >
                {c.body}
              </Button>
            ))
          )}
        </div>

        <div className="flex gap-2 pt-2">
          <Button type="button" onClick={onSubmit} disabled={!selectedId || disabled}>
            Submit
          </Button>
        </div>

        {children ? <div className="mt-4 border-t pt-4" aria-live="polite">{children}</div> : null}
      </CardContent>
    </Card>
  );
}
