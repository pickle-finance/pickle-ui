import React, { FC, useState } from "react";

import { SunIcon } from "@heroicons/react/solid";
import ThemeModal from "./ThemeModal";

const ThemeToggle: FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <>
      <div
        className="group rounded-xl text-sm text-foreground-alt-200 font-bold hover:bg-background-light transition duration-300 ease-in-out focus:outline-none cursor-pointer px-4 py-2 mr-3"
        onClick={() => setIsOpen(true)}
      >
        <SunIcon className="h-5 w-5 fill-current" />
      </div>
      <ThemeModal isOpen={isOpen} closeModal={() => setIsOpen(false)} />
    </>
  );
};

export default ThemeToggle;
