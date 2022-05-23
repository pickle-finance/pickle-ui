import { FC, forwardRef } from "react";
import { QuestionMarkCircleIcon } from "@heroicons/react/solid";
import Tippy from "@tippyjs/react";

const TooltipContent: FC = ({ children }) => (
  <div className="rounded-lg shadow-lg border border-foreground-alt-500 overflow-hidden">
    <div className="bg-background-light px-3 py-2">
      <div className="text-primary-light text-base font-normal">{children}</div>
    </div>
  </div>
);

/**
 * Component children passed to Tippy must be forwarded ref:
 * https://github.com/atomiks/tippyjs-react#component-children
 * The callback function needs a name to satisfy react/display-name
 * linter rule.
 */
const TooltipTarget = forwardRef<HTMLSpanElement>(function TooltipTarget(props, ref) {
  return (
    <span
      ref={ref}
      className="cursor-pointer transition-colors duration-300 hover:text-accent ml-1"
      {...props}
    >
      <QuestionMarkCircleIcon className="inline-block w-4 h-4 mx-1 align-top" />
    </span>
  );
});

const MoreInfo: FC = ({ children }) => (
  <Tippy duration={0} content={<TooltipContent>{children}</TooltipContent>}>
    <TooltipTarget />
  </Tippy>
);

export default MoreInfo;
