import { assert, expect } from "chai";
import {
  Channel,
  Context,
  DesktopAgent,
  getOrCreateChannel,
  Listener,
  OpenError,
} from "fdc3_1_2";
import APIDocumentation from "../../../apiDocuments";
import constants from "../../../constants";
import { sleep, wait } from "../../../utils";
import { AppControlContext } from "../../common/channel-control";
import { MockAppContext, OpenControl } from "../../common/open-control";

declare let fdc3: DesktopAgent;
const openDocs = "\r\nDocumentation: " + APIDocumentation.open + "\r\nCause:";
const testTimeoutMessage = `Test timeout - An error was not thrown within the allocated timeout of ${constants.NoListenerTimeout}. This timeout is not defined by the standard, rather by each implementation. Hence, if you DA implementation uses a longer timeout the constants.NoListenerTimeout in the test framework will need to be increased.`;

export class OpenControl1_2 implements OpenControl<Context> {
  contextReceiver = async (contextType: string): Promise<Context> => {
    const appControlChannel = await getOrCreateChannel("app-control");
    let timeout;
    const messageReceived = new Promise<Context>(async (resolve, reject) => {
      const listener = appControlChannel.addContextListener(
        contextType,
        async (context: MockAppContext) => {
          if (context.errorMessage !== undefined) {
            reject(new Error(context.errorMessage));
          } else {
            resolve(context);
          }
          clearTimeout(timeout);
          listener.unsubscribe();
        }
      );
      //if no context received reject promise
      const { promise: thePromise, timeout: theTimeout } = sleep();
      timeout = theTimeout;
      await thePromise;
      reject(new Error("No context received from app B"));
    });

    return messageReceived;
  };

  openIntentApp = async (appName: string, appId?: string, context?: Context) => {
    if(appId){
        if(context){
            await fdc3.open({ name: appName, appId: appId }, context);
        }
        await fdc3.open({ name: appName, appId: appId });
    } else if (context){
        await fdc3.open({ name: appName }, context);
    }else{
        await fdc3.open({ name: appName });
    }
  };

  addListenerAndFailIfReceived = async () => {
    const appControlChannel = await getOrCreateChannel("app-control");
    await appControlChannel.addContextListener(
      "context-received",
      (context: MockAppContext) => {
        assert.fail(context.errorMessage);
      }
    );
  };

  closeAppWindows = async (testId) => {
    await broadcastCloseWindow(testId);
    const appControlChannel = await fdc3.getOrCreateChannel("app-control");
    await waitForContext("windowClosed", testId, appControlChannel);
    await wait(constants.WindowCloseWaitTime);
  };

  expectAppTimeoutErrorOnOpen = async (context: Context, appId?: string, appName?: string) => {
    const testTimeout = setTimeout(() => {
      assert.fail(openDocs + testTimeoutMessage);
    }, constants.NoListenerTimeout);

    try {
        await this.openIntentApp(appName, appId, context);
        assert.fail(`No error was thrown - this app does not add a context listener and cannot receive the context passed, which the Desktop Agent should detect and throw the relevant error.${openDocs}`);
    } catch (ex) {
      expect(ex).to.have.property("message", OpenError.AppTimeout, openDocs);
    } finally {
      clearTimeout(testTimeout);
    }
  };

  confirmAppNotFoundErrorReceived = (exception: DOMException) => {
    expect(exception).to.have.property(
      "message",
      OpenError.AppNotFound,
      openDocs
    );
  };

  validateReceivedContext = async (contextReceiver: Promise<Context>, expectedContextType: string) => {
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
      executionListener = fdc3.addContextListener(contextType, handler);
    } else {
      console.log("adding listener in waitforcontext");
      executionListener = channel.addContextListener(
        contextType,
        handler
      );
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
                  ` CHecking for current context of type "${contextType}" for test: "${testId}" Current context did ${
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
  const appControlChannel = await fdc3.getOrCreateChannel("app-control");
  appControlChannel.broadcast({
    type: "closeWindow",
    testId: currentTest,
  } as AppControlContext);
};


