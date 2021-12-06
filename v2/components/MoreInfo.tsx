import { FC, forwardRef } from "react";
import { QuestionMarkCircleIcon } from "@heroicons/react/solid";
import Tippy from "@tippyjs/react";

interface Props {
  text: string;
}

const TooltipContent: FC<Props> = ({ text }) => (
  <div className="rounded-lg shadow-lg border border-gray-dark overflow-hidden">
    <div className="bg-black-light px-3 py-2">
      <span className="text-gray-light text-sm">{text}</span>
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
      className="cursor-pointer transition-colors duration-300 hover:text-orange ml-1"
      {...props}
    >
      <QuestionMarkCircleIcon className="inline-block w-4 h-4 mx-1 align-top" />
    </span>
  );
});

const MoreInfo: FC<Props> = ({ text }) => (
  <Tippy content={<TooltipContent text={text} />}>
    <TooltipTarget />
  </Tippy>
);

export default MoreInfo;
