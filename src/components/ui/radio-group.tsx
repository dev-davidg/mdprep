import * as React from "react";

type Ctx = { value: string; setValue: (v: string) => void; disabled?: boolean };
const RadioCtx = React.createContext<Ctx | null>(null);

export function RadioGroup({
  value,
  onValueChange,
  disabled,
  children,
  ...props
}: {
  value: string;
  onValueChange: (v: string) => void;
  disabled?: boolean;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>) {
  const ctx = React.useMemo<Ctx>(() => ({ value, setValue: onValueChange, disabled }), [value, onValueChange, disabled]);
  return (
    <RadioCtx.Provider value={ctx}>
      <div role="radiogroup" {...props}>{children}</div>
    </RadioCtx.Provider>
  );
}

export function RadioGroupItem({
  id,
  value,
  disabled,
  ...props
}: {
  id: string;
  value: string;
  disabled?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  const ctx = React.useContext(RadioCtx);
  if (!ctx) throw new Error("RadioGroupItem must be used within RadioGroup");
  const checked = ctx.value === value;
  return (
    <input
      id={id}
      type="radio"
      role="radio"
      aria-checked={checked}
      checked={checked}
      onChange={() => ctx.setValue(value)}
      disabled={disabled ?? ctx.disabled}
      {...props}
    />
  );
}
