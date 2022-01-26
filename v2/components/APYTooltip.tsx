import { FC, forwardRef } from "react";
import { QuestionMarkCircleIcon } from "@heroicons/react/solid";
import Tippy from "@tippyjs/react";

import type { JarDetails } from "../types";

interface TooltipContentProps {
  chain: string;
  name: string;
}

const TooltipContent: FC<TooltipContentProps> = ({ name, chain }) => (
  <div className="rounded-lg shadow-lg border border-gray-dark overflow-hidden">
    <div className="bg-black-light p-3 sm:gap-8">
      <p className="text-green-light text-base font-normal">
        {name}
        <span className="text-gray-light text-xs ml-2">{chain}</span>
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
  ref
) {
  return (
    <span
      ref={ref}
      className="cursor-pointer transition-colors duration-300 hover:text-orange"
      {...props}
    >
      <QuestionMarkCircleIcon className="inline-block w-5 h-5 mx-1 align-top" />
    </span>
  );
});

interface Props {
  maxAPY: JarDetails;
}

const APYTooltip: FC<Props> = ({ maxAPY }) => (
  <Tippy content={<TooltipContent name={maxAPY.name} chain={maxAPY.chain} />}>
    <TooltipTarget />
  </Tippy>
);

export default APYTooltip;
