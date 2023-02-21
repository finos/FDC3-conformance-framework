import { assert, expect } from "chai";
import {
  Channel,
  Context,
  DesktopAgent,
  Listener,
  OpenError,
  TargetApp,
} from "fdc3_1_2";
import { APIDocumentation1_2 } from "../apiDocuments-1.2";
import constants from "../../../constants";
import { sleep, wait } from "../../../utils";
import { AppControlContext } from "../../common/channel-control";
import { MockAppContext, OpenControl } from "../../common/open-control";

declare let fdc3: DesktopAgent;
const openDocs =
  "\r\nDocumentation: " + APIDocumentation1_2.open + "\r\nCause:";

export class OpenControl1_2 implements OpenControl<Context> {
  contextReceiver = async (
    contextType: string,
    expectNotToReceiveContext?: boolean
  ): Promise<Context | void> => {
    const appControlChannel = await fdc3.getOrCreateChannel(
      constants.ControlChannel
    );
    let timeout;
    const messageReceived = new Promise<Context | void>(
      async (resolve, reject) => {
        const listener = appControlChannel.addContextListener(
          contextType,
          async (context: MockAppContext) => {
            if (context.errorMessage) {
              reject(context.errorMessage);
            } else {
              resolve(context);
            }
            //clearTimeout(timeout);
            listener.unsubscribe();
          }
        );
        //if no context received reject promise
        const { promise: thePromise, timeout: theTimeout } = sleep();
        timeout = theTimeout;
        await thePromise;
        if (!expectNotToReceiveContext) {
          reject(new Error("No context received from app B"));
        } else {
          resolve();
        }
      }
    );
    return messageReceived;
  };

  openMockApp = async (
    appName: string,
    appId?: string,
    contextType?: string,
    targetAppAsString?: boolean,
    malformedContext?: boolean
  ) => {
    let targetApp: TargetApp;
    let context: Context;

    if (malformedContext) {
      // @ts-ignore
      await fdc3.open(appName, { name: "this is a malformed context" });
    } else {
      //set TargetApp parameter
      if (appId) {
        targetApp = { name: appName, appId: appId };
      } else if (targetAppAsString) {
        targetApp = appName;
      } else {
        targetApp = { name: appName };
      }

      //set context parameter
      if (contextType) {
        context = { type: contextType, name: "context" };
        await fdc3.open(targetApp, context);
      } else {
        await fdc3.open(targetApp);
      }
    }
  };

  addListenerAndFailIfReceived = async () => {
    const appControlChannel = await fdc3.getOrCreateChannel(
      constants.ControlChannel
    );
    await appControlChannel.addContextListener(
      "context-received",
      (context: MockAppContext) => {
        assert.fail(context.errorMessage);
      }
    );
  };

  closeAppWindows = async (testId) => {
    await broadcastCloseWindow(testId);
    const appControlChannel = await fdc3.getOrCreateChannel(
      constants.ControlChannel
    );
    await waitForContext("windowClosed", testId, appControlChannel);
    await wait(constants.WindowCloseWaitTime);
  };

  confirmAppNotFoundErrorReceived = (exception: DOMException) => {
    expect(exception).to.have.property(
      "message",
      OpenError.AppNotFound,
      openDocs
    );
  };

  validateReceivedContext = async (
    contextReceiver: Promise<Context | void>,
    expectedContextType: string
  ) => {
    const receivedValue = (await contextReceiver) as any;
    expect(receivedValue.context.name).to.eq("context", openDocs);
    expect(receivedValue.context.type).to.eq(expectedContextType, openDocs);
  };
}

const waitForContext = (
  contextType: string,
  testId: string,
  channel?: Channel
): Promise<Context> => {
  let executionListener: Listener;
  return new Promise<Context>(async (resolve) => {
    console.log(
      Date.now() +
        ` Waiting for type: "${contextType}", on channel: "${channel.id}" in test: "${testId}"`
    );

    const handler = (context: AppControlContext) => {
      console.log(` waitforcontext hander reached`);
      if (testId) {
        console.log(` ${testId} VS ${context.testId}`);
        if (testId == context.testId) {
          console.log(
            Date.now() + ` Received ${contextType} for test: ${testId}`
          );
          resolve(context);
          if (executionListener) executionListener.unsubscribe();
        } else {
          console.warn(
            Date.now() +
              ` Ignoring "${contextType}" context due to mismatched testId (expected: "${testId}", got "${context.testId}")`
          );
        }
      } else {
        console.log(
          Date.now() +
            ` Received (without testId) "${contextType}" for test: "${testId}"`
        );
        resolve(context);
        if (executionListener) executionListener.unsubscribe();
      }
    };

    if (channel === undefined) {
      console.log("adding system channel listener in waitForContext");
      executionListener = fdc3.addContextListener(contextType, handler);
    } else {
      console.log(
        `adding app channel (${channel.id}) listener in waitforcontext`
      );
      executionListener = channel.addContextListener(contextType, handler);
      //App channels do not auto-broadcast current context when you start listening, so retrieve current context to avoid races
      const ccHandler = async (context: AppControlContext) => {
        if (context) {
          if (testId) {
            if (testId == context?.testId && context?.type == contextType) {
              console.log(
                Date.now() +
                  ` Received "${contextType}" (from current context) for test: "${testId}"`
              );
              if (executionListener) executionListener.unsubscribe();
              resolve(context);
            } //do not warn as it will be ignoring mismatches which will be common
            else {
              console.log(
                Date.now() +
                  ` Checking for current context of type "${contextType}" for test: "${testId}" Current context did ${
                    context ? "" : "NOT "
                  } exist,
              had testId: "${context?.testId}" (${
                    testId == context?.testId ? "did match" : "did NOT match"
                  })
              and type "${context?.type}" vs ${contextType} (${
                    context?.type == contextType ? "did match" : "did NOT match"
                  })`
              );
            }
          } else {
            console.log(
              Date.now() +
                ` Received "${contextType}" (from current context) for an unspecified test`
            );
            if (executionListener) executionListener.unsubscribe();
            resolve(context);
          }
        }
      };
      channel.getCurrentContext().then(ccHandler);
    }
  });
};

const broadcastCloseWindow = async (currentTest) => {
  const appControlChannel = await fdc3.getOrCreateChannel(
    constants.ControlChannel
  );
  appControlChannel.broadcast({
    type: "closeWindow",
    testId: currentTest,
  } as AppControlContext);
};
