import { FC, ReactNode } from "react";

interface ContentContainerProps {
  children: ReactNode;
  className?: string;
}

export const ContentContainer: FC<ContentContainerProps> = ({ children, className = "" }) => {
  return <div className={`max-w-7xl mx-auto ${className}`}>{children}</div>;
};
