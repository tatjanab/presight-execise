import { Component, type ErrorInfo, type ReactNode } from "react";
import { StatusMessage } from "./StatusMessage";

type ErrorBoundaryProps = { children: ReactNode };
type ErrorBoundaryState = { hasError: boolean };

/** Shows a reload prompt instead of a blank page when rendering crashes. */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="grid h-dvh place-items-center bg-brand-100/70 p-6">
        <StatusMessage
          tone="error"
          action={{ label: "Reload", onClick: () => window.location.reload() }}
        >
          Something went wrong.
        </StatusMessage>
      </div>
    );
  }
}
