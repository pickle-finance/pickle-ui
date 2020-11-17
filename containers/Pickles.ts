import { createContainer } from "unstated-next";
import { usePicklePerBlock } from "./Pickles/usePicklePerBlock";

function usePickles() {
  const { picklePerBlock } = usePicklePerBlock();
  return { picklePerBlock };
}

export const Pickles = createContainer(usePickles);
