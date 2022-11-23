import { OpenError, Context, Channel, Listener, getOrCreateChannel } from "fdc3_1_2";
import { assert, expect } from "chai";
import APIDocumentation from "../../../apiDocuments";
import constants from "../../../constants";
import { DesktopAgent } from "fdc3_1_2/dist/api/DesktopAgent";
import { sleep, wait } from "../../../utils";

declare let fdc3: DesktopAgent;

const appBName = "MockApp";
const appBId = "MockAppId";
const noListenerAppId = "IntentAppAId";
const noListenerAppName = "IntentAppA";
const genericListenerAppId = "IntentAppCId";
const genericListenerAppName = "IntentAppC";

const openDocs = "\r\nDocumentation: " + APIDocumentation.open + "\r\nCause: ";
const testTimeoutMessage = `Test timeout - An error was not thrown within the allocated timeout of ${constants.NoListenerTimeout}. This timeout is not defined by the standard, rather by each implementation. Hence, if you DA implementation uses a longer timeout the constants.NoListenerTimeout in the test framework will need to be increased.`;

/**
 * Details on the mock apps used in these tests can be found in /mock/README.md
 */
export default () =>
  describe("fdc3.open", () => {
    beforeEach(async () => {
      await fdc3.leaveCurrentChannel();
    });

    const AOpensB1Test =
      "(AOpensB1) Can open app B from app A with no context and string as target";
    it(AOpensB1Test, async () => {
      const result = createReceiver("fdc3-conformance-opened");
      await fdc3.open(appBName);
      await result;
      await closeAppWindows(AOpensB1Test);
    });

    const AOpensB2Test =
      "(AOpensB2) Can open app B from app A with no context and AppMetadata (name) as target";
    it(AOpensB2Test, async () => {
      const result = createReceiver("fdc3-conformance-opened");
      await fdc3.open({ name: appBName });
      await result;
      await closeAppWindows(AOpensB2Test);
    });

    const AOpensB3Test =
      "(AOpensB3) Can open app B from app A with no context and AppMetadata (name and appId) as target";
    it(AOpensB3Test, async () => {
      const result = createReceiver("fdc3-conformance-opened");
      await fdc3.open({ name: appBName, appId: appBId });
      await result;
      await closeAppWindows(AOpensB3Test);
    });

    const AFailsToOpenB1Test =
      "(AFailsToOpenB1) Receive AppNotFound error when targeting non-existent app name as target";
    it(AFailsToOpenB1Test, async () => {
      try {
        await fdc3.open("ThisAppDoesNotExist");
        assert.fail("No error was not thrown", openDocs);
      } catch (ex) {
        expect(ex).to.have.property("message", OpenError.AppNotFound, openDocs);
      }
    });
    const AFailsToOpenB2Test =
      "(AFailsToOpenB2) Receive AppNotFound error when targeting non-existent app AppMetadata (name) as target";
    it(AFailsToOpenB2Test, async () => {
      try {
        await fdc3.open({
          name: "ThisAppDoesNotExist",
        });
        assert.fail("No error was not thrown", openDocs);
      } catch (ex) {
        expect(ex).to.have.property("message", OpenError.AppNotFound, openDocs);
      }
    });

    const AFailsToOpenB3 =
      "(AFailsToOpenB3) Receive AppNotFound error when targeting non-existent app AppMetadata (name and appId) as target";
    it(AFailsToOpenB3, async () => {
      try {
        await fdc3.open({
          name: "ThisAppDoesNotExist",
          appId: "ThisAppDoesNotExist",
        });
        assert.fail("No error was not thrown", openDocs);
      } catch (ex) {
        expect(ex).to.have.property("message", OpenError.AppNotFound, openDocs);
      }
    });

    const AOpensBWithSpecificContext1Test =
      "(AOpensBWithSpecificContext1) Can open app B from app A with context and string as target, app B adds specific listener";
    it(AOpensBWithSpecificContext1Test, async () => {
      const receiver = createReceiver("fdc3-conformance-context-received");
      await fdc3.open(appBName, {
        name: "context",
        type: "fdc3.testReceiver",
      });
      const receivedValue = (await receiver) as any;
      expect(receivedValue.context.name).to.eq("context", openDocs);
      expect(receivedValue.context.type).to.eq("fdc3.testReceiver", openDocs);
      await closeAppWindows(AOpensBWithSpecificContext1Test);
    });

    const AOpensBWithSpecificContext2Test =
      "(AOpensBWithSpecificContext2) Can open app B from app A with context and AppMetadata (name) as target, app B adds specific listener";
    it(AOpensBWithSpecificContext2Test, async () => {
      const receiver = createReceiver("fdc3-conformance-context-received");
      await fdc3.open(
        { name: appBName },
        { name: "context", type: "fdc3.testReceiver" }
      );
      const receivedValue = (await receiver) as any;
      expect(receivedValue.context.name).to.eq("context", openDocs);
      expect(receivedValue.context.type).to.eq("fdc3.testReceiver", openDocs);
      await closeAppWindows(AOpensBWithSpecificContext2Test);
    });

    const AOpensBWithSpecificContext3Test =
      "(AOpensBWithSpecificContext3) Can open app B from app A with context and AppMetadata (name and appId) as target, app B adds specific listener";
    it(AOpensBWithSpecificContext3Test, async () => {
      const receiver = createReceiver("fdc3-conformance-context-received");
      await fdc3.open(
        { name: appBName, appId: appBId },
        { name: "context", type: "fdc3.testReceiver" }
      );
      const receivedValue = (await receiver) as any;
      expect(receivedValue.context.name).to.eq("context", openDocs);
      expect(receivedValue.context.type).to.eq("fdc3.testReceiver", openDocs);
      await closeAppWindows(AOpensBWithSpecificContext3Test);
    });

    const AOpensBWithContext1Test =
      "(AOpensBWithContext1) Can open app B from app A with context and string as target, app B adds generic listener";
    it(AOpensBWithContext1Test, async () => {
      const receiver = createReceiver("fdc3-conformance-context-received");
      await fdc3.open(genericListenerAppName, {
        name: "context",
        type: "fdc3.genericListener",
      });
      const receivedValue = (await receiver) as any;
      await closeAppWindows(AOpensBWithContext1Test);
      expect(receivedValue.context.name).to.eq("context", openDocs);
      expect(receivedValue.context.type).to.eq(
        "fdc3.genericListener",
        openDocs
      );
    });

    const AOpensBWithContext2Test =
      "(AOpensBWithContext2) Can open app B from app A with context and AppMetadata (name) as target, app B adds generic listener";
    it(AOpensBWithContext2Test, async () => {
      const receiver = createReceiver("fdc3-conformance-context-received");
      await fdc3.open(
        { name: genericListenerAppName },
        { name: "context", type: "fdc3.genericListener" }
      );
      const receivedValue = (await receiver) as any;
      await closeAppWindows(AOpensBWithContext2Test);
      expect(receivedValue.context.name).to.eq("context", openDocs);
      expect(receivedValue.context.type).to.eq(
        "fdc3.genericListener",
        openDocs
      );
    });

    const AOpensBWithContext3Test =
      "(AOpensBWithContext3) Can open app B from app A with context and AppMetadata (name and appId) as target, app B adds generic listener";
    it(AOpensBWithContext3Test, async () => {
      const receiver = createReceiver("fdc3-conformance-context-received");
      await fdc3.open(
        { name: genericListenerAppName, appId: genericListenerAppId },
        { name: "context", type: "fdc3.genericListener" }
      );
      const receivedValue = (await receiver) as any;
      await closeAppWindows(AOpensBWithContext3Test);
      expect(receivedValue.context.name).to.eq("context", openDocs);
      expect(receivedValue.context.type).to.eq(
        "fdc3.genericListener",
        openDocs
      );
    });

    const AOpensBMultipleListenTest =
      "(AOpensBMultipleListen) Can open app B from app A with context and AppMetadata (name and appId) as target, app B has opened multiple listeners";
    it(AOpensBMultipleListenTest, async () => {
      const receiver = createReceiver("fdc3-conformance-context-received-multiple");
      await fdc3.open(
        { name: appBName, appId: appBId },
        { name: "context", type: "fdc3.testReceiverMultiple" }
      );
      const receivedValue = (await receiver) as any;
      expect(receivedValue.context.name).to.eq("context", openDocs);
      expect(receivedValue.context.type).to.eq(
        "fdc3.testReceiverMultiple",
        openDocs
      );
      await closeAppWindows(AOpensBMultipleListenTest);
    });


    const AOpensBNoListenTest =
      "(AOpensBNoListen) Receive AppTimeout error when targeting app with no listeners";
    it(AOpensBNoListenTest, async () => {
      //fail the test just before it times out if no error is returned
      let timeout = setTimeout(()=>{
        assert.fail(openDocs + testTimeoutMessage);
      }, constants.NoListenerTimeout);
      try {
        await fdc3.open(
          { name: noListenerAppName, appId: noListenerAppId },
          { name: "context", type: "fdc3.testReceiver" }
        );
        assert.fail(openDocs + "No error was thrown - this app does not add a context listener and cannot receive the context passed, which the Desktop Agent should detect and throw the relevant error.");
      } catch (ex) {
        expect(ex).to.have.property("message", OpenError.AppTimeout, openDocs);
      } finally {
        clearTimeout(timeout);
      }
    }).timeout(constants.NoListenerTimeout + 1000);

    const AOpensBWithWrongContextTest =
      "(AOpensBWithWrongContext) Receive AppTimeout error when targeting app with wrong context";
    it(AOpensBWithWrongContextTest, async () => {
      //fail the test just before it times out if no error is returned
      let timeout = setTimeout(()=>{
        assert.fail(openDocs + testTimeoutMessage);
      }, constants.NoListenerTimeout);
      try {
        await fdc3.open(
          { name: appBName },
          { name: "context", type: "fdc3.thisContextDoesNotExist" }
        );
        assert.fail(openDocs + "No error was thrown - this app does not add a listener for the context type passed, which the Desktop Agent should detect and throw the relevant error.");
      } catch (ex) {
        expect(ex).to.have.property("message", OpenError.AppTimeout, openDocs);
      } finally {
        clearTimeout(timeout);
      }
      await closeAppWindows(AOpensBWithWrongContextTest);
    }).timeout(constants.NoListenerTimeout + 1000);
  });

// creates a channel and subscribes for broadcast contexts. This is
// used by the 'mock app' to send messages back to the test runner for validation
const createReceiver = async (contextType: string) => {
  const appControlChannel = await getOrCreateChannel("app-control");
  let timeout;
  const messageReceived = new Promise<Context>(async (resolve, reject) => {
    const listener = appControlChannel.addContextListener(contextType, (context) => {
      resolve(context);
      clearTimeout(timeout);
      listener.unsubscribe();
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
      executionListener = fdc3.addContextListener(contextType, handler);
    } else {
      console.log("adding listener in waitforcontext");
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

interface AppControlContext extends Context {
  testId: string;
}
