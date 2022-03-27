import { FC } from "react";
import { ExclamationIcon } from "@heroicons/react/outline";

interface Props {
  error: Error | undefined;
}

const Error: FC<Props> = ({ error }) => {
  if (!error) return null;

  return (
    <>
      <div className="flex justify-center">
        <ExclamationIcon className="w-6 h-6 text-accent" />
      </div>
      <p className="text-foreground-alt-300 text-sm mt-2 mb-6">{error.message}</p>
    </>
  );
};

export default Error;
