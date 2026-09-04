"use client";

import { MODELS } from "@/lib/models";

export function ModelPicker({
  value,
  onChange,
  disabled,
  models,
}: {
  value: string;
  onChange: (modelId: string) => void;
  disabled?: boolean;
  /** Which models to offer; defaults to all. Pass the configured ones to hide unusable models. */
  models?: { id: string; label: string }[];
}) {
  const options = models && models.length > 0 ? models : MODELS;
  return (
    <select
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-md border border-black/10 bg-transparent px-3 py-1.5 text-sm dark:border-white/15"
    >
      {options.map((model) => (
        <option key={model.id} value={model.id}>
          {model.label}
        </option>
      ))}
    </select>
  );
}
