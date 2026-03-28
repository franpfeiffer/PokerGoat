import { type ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
      {icon && (
        <div className="mb-1 text-velvet-600" aria-hidden="true">
          {icon}
        </div>
      )}
      <p className="text-sm font-medium text-velvet-300">{title}</p>
      {description && (
        <p className="max-w-xs text-xs text-velvet-500 leading-relaxed">{description}</p>
      )}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
