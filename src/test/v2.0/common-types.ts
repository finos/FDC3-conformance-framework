import { Context } from "fdc3_2_0";

export interface ContextWithError extends Context {
    errorMessage?: string;
  }

  export interface IntentUtilityContext extends Context {
    delayBeforeReturn?: number;
    onUnsubscribedTriggered?: boolean;
    number?: number;
  }