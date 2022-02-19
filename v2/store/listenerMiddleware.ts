import {
  createListenerMiddleware,
  TypedStartListening,
} from "@rtk-incubator/action-listener-middleware";

import type { RootState } from ".";

export const listenerMiddleware = createListenerMiddleware();

export const startAppListening = listenerMiddleware.startListening as TypedStartListening<
  RootState
>;
