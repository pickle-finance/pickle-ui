import { FC, ReactNode, ButtonHTMLAttributes } from "react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  type?: "primary" | "secondary" | "outline";
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}

const Button: FC<Props> = ({
  children,
  type = "primary",
  disabled = false,
  onClick,
  className = "",
  ...rest
}) => {
  let buttonStyle = "";

  switch (type) {
    case "primary":
      buttonStyle = `bg-accent hover:bg-accent-light text-foreground-alt-100 
                    ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`;
      break;
    case "secondary":
      buttonStyle = `bg-background-light hover:bg-background-lightest text-foreground
                    ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`;
      break;
    case "outline":
      buttonStyle = `bg-transparent border border-accent text-accent hover:bg-accent hover:text-foreground-alt-100 
                    ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`;
      break;
  }

  return (
    <button
      className={`font-body rounded-xl px-4 py-2 text-sm font-medium transition duration-300 ease-in-out ${buttonStyle} ${className}`}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  );
};

export default Button;
