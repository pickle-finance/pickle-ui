import { createContainer } from "unstated-next";
import { usePicklePerBlock } from "./Pickles/usePicklePerBlock";
import { usePicklePerSecond } from "./Pickles/usePicklePerSecond";

function usePickles() {
  const { picklePerBlock } = usePicklePerBlock();
  return { picklePerBlock };
}

function useMiniPickles() {
  const { picklePerSecond } = usePicklePerSecond();
  return { picklePerSecond };
}

export const Pickles = createContainer(usePickles);
export const MiniPickles = createContainer(useMiniPickles);
