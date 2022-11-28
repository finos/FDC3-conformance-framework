import { OpenError, Context, getOrCreateChannel, Channel, Listener } from "fdc3_2_0";
import { assert, expect } from "chai";
import APIDocumentation from "../../../apiDocuments";
import { DesktopAgent } from "fdc3_2_0/dist/api/DesktopAgent";
import { sleep, wait, wrapPromise } from "../../../utils";
import constants from "../../../constants";
import { MockAppContext } from "../../../mock/v2.0/mock-functions";
import { AppControlContext } from "../../common/channel-control";

declare let fdc3: DesktopAgent;
const openDocs = "\r\nDocumentation: " + APIDocumentation.open + "\r\nCause:";

const appBId = "MockAppId";
const intentAppC = "IntentAppCId";

export default () =>
  describe("fdc3.open", () => {
    const AOpensB1 = "(2.0-AOpensB1) Can open app B from app A with AppIdentifier (appId) as target";
    it(AOpensB1, async () => {
      const result = createReceiver("fdc3-conformance-opened");
      await fdc3.open({ appId: appBId });
      await result;
      await closeAppWindows(AOpensB1);
    });

    it("(2.0-AFailsToOpenB) Receive AppNotFound error when targeting non-existent AppIdentifier (appId) as target", async () => {
      try {
        await fdc3.open({ appId: "ThisAppDoesNotExist" });
        assert.fail("No error was not thrown", openDocs);
      } catch (ex) {
        expect(ex).to.have.property("message", OpenError.AppNotFound, openDocs);
      }
    });

    const AOpensBWithContext = "(2.0-AOpensBWithContext) Can open app B from app A with context and AppIdentifier (appId) as target but app B listening for null context";
    it(AOpensBWithContext, async () => {
      const receiver = createReceiver("context-received");
      await fdc3.open(
        { appId: intentAppC },
        { type: "fdc3.instrument" }
      );
      const receivedValue = (await receiver) as any;
      expect(receivedValue.context.type).to.eq("fdc3.instrument", openDocs);
      await closeAppWindows(AOpensBWithContext);
    });

    const AOpensBWithSpecificContext = "(2.0-AOpensBWithSpecificContext) Can open app B from app A with context and AppIdentifier (appId) as target and app B is expecting context";
    it(AOpensBWithSpecificContext, async () => {
      const receiver = createReceiver("context-received");
      await fdc3.open(
        { appId: appBId },
        { type: "fdc3.instrument" }
      );
      const receivedValue = (await receiver) as any;
      expect(receivedValue.context.type).to.eq(
        "fdc3.instrument",
        openDocs
      );
      await closeAppWindows(AOpensBWithSpecificContext);
    });

    const AOpensBMultipleListen = "(2.0-AOpensBMultipleListen) Can open app B from app A with context and AppIdentifier (appId) as target but app B add listener before correct one";
    it(AOpensBMultipleListen, async () => {
      const receiver = createReceiver("context-received");
      await fdc3.open(
        { appId: appBId },
        { type: "fdc3.instrument" }
      );
      const receivedValue = (await receiver) as any;
      expect(receivedValue.context.type).to.eq(
        "fdc3.instrument",
        openDocs
      );
      await closeAppWindows(AOpensBMultipleListen);
    });

    const AOpensBWithWrongContext = "(2.0-AOpensBWithWrongContext) Received App time out when opening app B with fake context, app b listening for different context";
    it(AOpensBWithWrongContext, async () => {
      const appControlChannel = await getOrCreateChannel("app-control");
      await appControlChannel.addContextListener("context-received", (context: MockAppContext)=>{
        assert.fail(context.errorMessage);
      });

      let timeout;
      const wrapper = wrapPromise();
      try {
        await fdc3.open(
          { appId: "OpenAppAId" },
          { type: "fdc3.contextDoesNotExist" }
        );
      } catch (ex) {
        expect(ex).to.have.property("message", OpenError.AppTimeout, openDocs);
        wrapper.resolve();
        clearTimeout(timeout);
      }

      timeout = await window.setTimeout(() => {
        wrapper.reject(new Error("Expected AppTimeout error. No rejection received from the open promise"));
      }, 10000);

      await wrapper.promise;
    });

    const AOpensBNoListen = "(2.0-AOpensBNoListen) Received App time out when opening app B with fake context, app b not listening for any context";
    let timeout;
      const wrapper = wrapPromise();
    it(AOpensBNoListen, async () => {
      try {
        await fdc3.open(
          { appId: "OpenAppBId" },
          { type: "fdc3.contextDoesNotExist" }
        );
      } catch (ex) {
        expect(ex).to.have.property("message", OpenError.AppTimeout, openDocs);
        wrapper.resolve();
        clearTimeout(timeout);
      }

      timeout = await window.setTimeout(() => {
        wrapper.reject(new Error("Expected AppTimeout error. No rejection received from the open promise"));
      }, 10000);

      await wrapper.promise;
    });
  });

// creates a channel and subscribes for broadcast contexts. This is
// used by the 'mock app' to send messages back to the test runner for validation
const createReceiver = async (contextType: string) => {
  const appControlChannel = await getOrCreateChannel("app-control");
  let timeout;
  const messageReceived = new Promise<Context>(async (resolve, reject) => {
    const listener = await appControlChannel.addContextListener(contextType, async (context: MockAppContext) => {
      console.log(context.errorMessage);
      if(context.errorMessage !== undefined){
        console.log("ERROR RECEIVED");
        console.log(context.errorMessage);
        reject(new Error(context.errorMessage));
      }else{
        resolve(context);
      }
      clearTimeout(timeout);
      await listener.unsubscribe();
    });
    //if no context received reject promise
    const { promise: thePromise, timeout: theTimeout } = sleep();
    timeout = theTimeout;
    await thePromise;
    reject(new Error("No context received from app B"));
  });

  return messageReceived;
};

async function closeAppWindows(testId) {
  await broadcastCloseWindow(testId);
  const appControlChannel = await fdc3.getOrCreateChannel("app-control");
  await waitForContext("windowClosed", testId, appControlChannel);
  await wait(constants.WindowCloseWaitTime);
}

const broadcastCloseWindow = async (currentTest) => {
  const appControlChannel = await fdc3.getOrCreateChannel("app-control");
  appControlChannel.broadcast({
    type: "closeWindow",
    testId: currentTest,
  } as AppControlContext);
};

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
      executionListener = await fdc3.addContextListener(contextType, handler);
    } else {
      console.log("adding listener in waitforcontext");
      executionListener = await channel.addContextListener(contextType, handler);
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

