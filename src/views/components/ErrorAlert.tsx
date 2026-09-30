interface ErrorAlertProps {
  message: string;
}

export function ErrorAlert({ message }: ErrorAlertProps) {
  return (
    <div className="alert alert--error" role="alert">
      {message}
    </div>
  );
}
