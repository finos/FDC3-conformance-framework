export interface OpenControl<X> {
  //test control
  openIntentApp(appId: string, contextType?: string): void;
  closeAppWindows(testId: string): Promise<void>;

  //listening
  contextReceiver(contextType: string): Promise<X>;
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
};
