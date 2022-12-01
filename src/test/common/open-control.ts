export interface OpenControl<X> {
  //test control
  openMockApp(appName?: string, appId?: string, contextType?: string, targetAppAsString?: boolean, malformedContext?: boolean): void;
  closeAppWindows(testId: string): Promise<void>;

  //listening
  contextReceiver(contextType: string, expectNotToReceiveContext?: boolean): Promise<X>;
  addListenerAndFailIfReceived(): Promise<void>;

  //validation
  confirmAppNotFoundErrorReceived(exception: DOMException): void;
  validateReceivedContext(
    contextReceiver: Promise<X>,
    expectedContextType: string
  ): Promise<void>;
}

/** same in 1.2 and 2.0 */
export interface CommonContext {
  id?: {
    [key: string]: string;
  };
  name?: string;
  type: string;
}

export interface MockAppContext extends CommonContext {
  errorMessage?: string;
  ContextToSend?: CommonContext;
}

export const openApp = {
  a: {
    name: "IntentAppA",
    id: "IntentAppAId",
  },
  b: {
    name: "MockApp",
    id: "MockAppId",
  },
  c: {
    name: "IntentAppC",
    id: "IntentAppCId",
  },
  d: {
    id: "OpenAppAId",
  },
  e:{
    id: "OpenAppBId",
  },
  f: {
    name: "IntentAppB",
    id: "IntentAppBId"
  }
};

export type OpenCommonConfig = {
  fdc3Version: string,
  prefix: string,
  target: string,
  targetMultiple: string
}
