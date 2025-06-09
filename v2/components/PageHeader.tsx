import { FC, ReactNode } from "react";

interface PageHeaderProps {
  children: ReactNode;
  className?: string;
}

const PageHeader: FC<PageHeaderProps> = ({ children, className = "" }) => {
  return <div className={`mb-8 ${className}`}>{children}</div>;
};

export default PageHeader;
