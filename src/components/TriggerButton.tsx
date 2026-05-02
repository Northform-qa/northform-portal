interface Props {
  onClick: () => void;
  disabled: boolean;
  label: string;
}

export default function TriggerButton({ onClick, disabled, label }: Props) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center gap-2.5 px-6 py-3 rounded-lg font-semibold text-sm
        transition-all duration-150 select-none
        ${
          disabled
            ? "bg-forge-surface border border-forge-border text-forge-muted cursor-not-allowed"
            : "bg-forge-primary text-forge-bg hover:bg-forge-primary-dim cursor-pointer"
        }
      `}
    >
      {!disabled && <span className="w-2 h-2 rounded-full bg-current" />}
      {label}
    </button>
  );
}
