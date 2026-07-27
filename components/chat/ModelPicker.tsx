"use client";

import { MODELS } from "@/lib/models";

export function ModelPicker({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (modelId: string) => void;
  disabled?: boolean;
}) {
  return (
    <select
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-md border border-black/10 bg-transparent px-3 py-1.5 text-sm dark:border-white/15"
    >
      {MODELS.map((model) => (
        <option key={model.id} value={model.id}>
          {model.label}
        </option>
      ))}
    </select>
  );
}
