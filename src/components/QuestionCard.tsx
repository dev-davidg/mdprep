import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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
        <RadioGroup
          value={props.selectedId ?? ""}
          onValueChange={(v) => props.onSelect?.(v)}
          aria-label="Answer options"
        >
          {props.choices.map((c, i) => (
            <div key={c.id} className="flex items-center space-x-2">
              <RadioGroupItem id={`${baseId}-${i}`} value={c.id} disabled={props.disabled} />
              <Label htmlFor={`${baseId}-${i}`} className="leading-6">{c.body}</Label>
            </div>
          ))}
        </RadioGroup>

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
