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
      className="w-full rounded-lg text-[14px] font-medium transition-[filter] duration-200 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-forge-accent focus-visible:outline-offset-2"
      style={{
        height: "44px",
        ...(disabled
          ? {
              background: "rgba(245, 158, 11, 0.1)",
              color: "#F59E0B",
              border: "1px solid rgba(245, 158, 11, 0.25)",
              cursor: "default",
            }
          : {
              background: "#F59E0B",
              color: "#0A0A0F",
              border: "none",
              cursor: "pointer",
            }),
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          (e.currentTarget as HTMLButtonElement).style.filter =
            "brightness(1.1)";
        }
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.filter = "";
      }}
    >
      {label}
    </button>
  );
}
