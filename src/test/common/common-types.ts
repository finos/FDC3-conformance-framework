/** same in 1.2 and 2.0 */
export interface CommonContext {
  id?: {
    [key: string]: string;
  };
  name?: string;
  type: string;
}

export interface AppControlContext extends CommonContext {
  testId?: string;
}

export interface ContextWithError extends CommonContext {
  errorMessage?: string;
  instanceId?: string;
}

export interface IntentUtilityContext extends CommonContext {
  delayBeforeReturn?: number;
  onUnsubscribedTriggered?: boolean;
  number?: number;
}
