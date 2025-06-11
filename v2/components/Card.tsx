import { FC, ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

interface CardBodyProps {
  children: ReactNode;
  className?: string;
}

const Header: FC<CardHeaderProps> = ({ children, className = "" }) => (
  <div className={`px-6 py-4 border-b border-foreground-alt-500 ${className}`}>{children}</div>
);

const Body: FC<CardBodyProps> = ({ children, className = "" }) => (
  <div className={className}>{children}</div>
);

const Card: FC<CardProps> & {
  Header: FC<CardHeaderProps>;
  Body: FC<CardBodyProps>;
} = ({ children, className = "" }) => {
  return (
    <div
      className={`bg-background-light rounded-xl border border-foreground-alt-500 shadow ${className}`}
    >
      {children}
    </div>
  );
};

Card.Header = Header;
Card.Body = Body;

export default Card;
