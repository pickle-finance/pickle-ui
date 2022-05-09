import { useTranslation } from "next-i18next";
import React, { Component, ErrorInfo, FC, ReactNode } from "react";
import { classNames } from "v2/utils";
import Link from "v2/components/Link";

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
      return <ErrorMessage />;
    }
    return this.props.children;
  }
}

const ErrorMessage: FC<{ className?: string }> = ({ className }) => {
  const { t } = useTranslation("common");
  return (
    <div className="flex flex-col justify-center items-center py-96">
      <div
        className={classNames(
          "bg-background-light w-1/3 indent-4 rounded-xl border border-foreground-alt-500 shadow p-12",
          className,
        )}
      >
        <div className="w-full text-justify">
          <p className="break-normal text-accent">{t("v2.error")}</p>
        </div>
        <div className="text-center">
          <Link className="mt-10" href="https://discord.gg/pickle-finance" external>
            <p className="on-hover:text-primary-light">discord.gg/pickle-finance</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ErrorBoundary;
