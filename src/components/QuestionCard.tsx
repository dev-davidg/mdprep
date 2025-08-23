import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useId } from "react";

export interface Choice { id: string; body: string; }
export interface QuestionProps {
  stem: string;
  choices: Choice[];
  selectedId?: string | null;
  disabled?: boolean;
  onSelect?: (choiceId: string) => void;
  onSubmit?: () => void;
  children?: React.ReactNode; // for explanation area
}

export default function QuestionCard(props: QuestionProps) {
  const baseId = useId();
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">{props.stem}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2" aria-label="Answer options">
          {props.choices.map((c) => (
            <Button
              key={c.id}
              variant={props.selectedId === c.id ? "default" : "outline"}
              size="md"
              disabled={props.disabled}
              onClick={() => props.onSelect?.(c.id)}
              className={props.selectedId === c.id ? "ring-2 ring-offset-2 ring-blue-600" : ""}
            >
              {c.body}
            </Button>
          ))}
        </div>

        <div className="flex gap-2 pt-2">
          <Button onClick={props.onSubmit} disabled={!props.selectedId || props.disabled}>
            Submit
          </Button>
        </div>

        {props.children ? (
          <div className="mt-4 border-t pt-4" aria-live="polite">
            {props.children}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
