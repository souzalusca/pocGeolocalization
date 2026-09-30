interface LocationButtonProps {
  label: string;
  isLoading: boolean;
  onClick: () => void;
}

export function LocationButton({ label, isLoading, onClick }: LocationButtonProps) {
  return (
    <button
      type="button"
      className="btn btn--primary"
      onClick={onClick}
      disabled={isLoading}
      aria-busy={isLoading}
    >
      {isLoading && <span className="spinner" aria-hidden="true" />}
      {label}
    </button>
  );
}
