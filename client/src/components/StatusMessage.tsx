import type { ReactNode } from "react";
import { focusRing } from "./styles";

type StatusMessageProps = {
  tone?: "muted" | "error";
  children: ReactNode;
  action?: { label: string; onClick: () => void };
  className?: string;
};

export function StatusMessage({
  tone = "muted",
  children,
  action,
  className = "",
}: StatusMessageProps) {
  const isError = tone === "error";

  return (
    <div
      role={isError ? "alert" : "status"}
      className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-sm ${
        isError ? "text-red-700" : "text-slate-500"
      } ${className}`}
    >
      <p>{children}</p>
      {action ? (
        <button
          type="button"
          onClick={action.onClick}
          className={`rounded font-medium text-brand-700 underline decoration-brand-300 underline-offset-2 hover:text-brand-800 hover:decoration-brand-500 ${focusRing}`}
        >
          {action.label}
        </button>
      ) : null}
    </div>
  );
}
