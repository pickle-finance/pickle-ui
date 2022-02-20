import { FC, forwardRef, ReactNode } from "react";
import { QuestionMarkCircleIcon } from "@heroicons/react/solid";
import Tippy from "@tippyjs/react";

interface Props {
  primaryText?: string | ReactNode;
  secondaryText?: string | ReactNode;
}

const TooltipContent: FC<Props> = ({ primaryText, secondaryText }) => (
  <div className="rounded-lg shadow-lg border border-gray-dark overflow-hidden">
    <div className="bg-background-light px-3 py-2">
      <p className="text-primary-light text-base font-normal">
        {primaryText && <span className="mr-2">{primaryText}</span>}
        <span className="text-foreground-alt-200 text-sm">{secondaryText}</span>
      </p>
    </div>
  </div>
);

/**
 * Component children passed to Tippy must be forwarded ref:
 * https://github.com/atomiks/tippyjs-react#component-children
 * The callback function needs a name to satisfy react/display-name
 * linter rule.
 */
const TooltipTarget = forwardRef<HTMLSpanElement>(function TooltipTarget(
  props,
  ref,
) {
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

const MoreInfo: FC<Props> = ({ primaryText = "", secondaryText = "" }) => (
  <Tippy
    content={
      <TooltipContent primaryText={primaryText} secondaryText={secondaryText} />
    }
  >
    <TooltipTarget />
  </Tippy>
);

export default MoreInfo;
