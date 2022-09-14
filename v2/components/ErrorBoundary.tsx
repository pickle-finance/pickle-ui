import { useTranslation } from "next-i18next";
import Image from "next/image";
import React, { Component, ErrorInfo, FC, ReactNode } from "react";

import { classNames } from "v2/utils";
import Button from "./Button";

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
    <div className="flex justify-center items-center py-8 lg:py-32">
      <div
        className={classNames(
          "bg-background-light w-4/5 lg:w-1/2 max-w-xl rounded-xl border border-foreground-alt-500 shadow p-6 md:p-12",
          className,
        )}
      >
        <div className="flex justify-center mt-2">
          <Image
            alt="Epic Fail"
            src="/animations/failure.gif"
            width={250}
            height={250}
            loading="eager"
          />
        </div>
        <div className="w-full text-center mb-8">
          <p className="break-normal text-foreground-alt-200">{t("v2.error")}</p>
        </div>
        <div className="flex justify-center">
          <Button href="https://discord.gg/pickle-finance">Discord</Button>
        </div>
      </div>
    </div>
  );
};

export default ErrorBoundary;
