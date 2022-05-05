import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    const { hasError } = this.state;
    if (hasError) {
      return (
        <div
          style={{
            color: "red",
            border: "1px solid red",
            borderRadius: "0.25rem",
            margin: "0.5rem",
            padding: "0.5rem",
          }}
        >
          An error was thrown.
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
