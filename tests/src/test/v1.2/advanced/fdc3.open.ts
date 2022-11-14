import { OpenError, Context, Channel, Listener } from "fdc3_1_2";
import { assert, expect } from "chai";
import APIDocumentation from "../../../apiDocuments";
import constants from "../../../constants";
import { DesktopAgent } from "fdc3_1_2/dist/api/DesktopAgent";

const fdc3 = <DesktopAgent>(<unknown>window.fdc3);
const appBName = "MockApp";
const appBId = "MockAppId";
const noListenerAppId = "IntentAppAId";
const noListenerAppName = "IntentAppA";
const genericListenerAppId = "IntentAppBId";
const genericListenerAppName = "IntentAppB";
let timeout: number;

const openDocs = "\r\nDocumentation: " + APIDocumentation.open + "\r\nCause";

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
      await fdc3.joinChannel("FDC3-Conformance-Channel");
      const result = createReceiver("fdc3-conformance-opened");
      await (<DesktopAgent>window.fdc3).open(appBName);
      await result;
      await closeAppWindows(AOpensB1Test);
    });

    const AOpensB2Test =
      "(AOpensB2Test) Can open app B from app A with no context and AppMetadata (name) as target";
    it(AOpensB2Test, async () => {
      await fdc3.joinChannel("FDC3-Conformance-Channel");
      const result = createReceiver("fdc3-conformance-opened");
      await (<DesktopAgent>window.fdc3).open({ name: appBName });
      await result;
      await closeAppWindows(AOpensB2Test);
    });

    const AOpensB3Test =
      "(AOpensB3Test) Can open app B from app A with no context and AppMetadata (name and appId) as target";
    it(AOpensB3Test, async () => {
      await fdc3.joinChannel("FDC3-Conformance-Channel");
      const result = createReceiver("fdc3-conformance-opened");
      await (<DesktopAgent>window.fdc3).open({ name: appBName, appId: appBId });
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
      await fdc3.joinChannel("FDC3-Conformance-Channel");
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
      await fdc3.joinChannel("FDC3-Conformance-Channel");
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
      await fdc3.joinChannel("FDC3-Conformance-Channel");
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

    // const AOpensBWithContext1Test =
    //   "(AOpensBWithContext1) Can open app B from app A with context and string as target, app B adds generic listener";
    // it(AOpensBWithContext1Test, async () => {
    //   await fdc3.joinChannel("fdc3.raiseIntent");
    //   const receiver = createReceiver("fdc3-conformance-context-received");
    //   await fdc3.open(genericListenerAppName, {
    //     name: "context",
    //     type: "fdc3.testReceiver",
    //   });
    //   const receivedValue = (await receiver) as any;
    //   expect(receivedValue.context.name).to.eq("context", openDocs);
    //   expect(receivedValue.context.type).to.eq("fdc3.testReceiver", openDocs);
    //   await closeAppWindows(AOpensBWithContext1Test);
    // });

    //     const AOpensBWithContext2Test =
    //       "(AOpensBWithContext2) Can open app B from app A with context and AppMetadata (name) as target, app B adds generic listener";
    //     it(AOpensBWithContext2Test, async () => {
    //       const receiver = createReceiver("fdc3-conformance-context-received");
    //       await fdc3.open(
    //         { name: genericListenerAppName },
    //         { name: "context", type: "fdc3.testReceiver" }
    //       );
    //       const receivedValue = (await receiver) as any;
    //       expect(receivedValue.context.name).to.eq("context", openDocs);
    //       expect(receivedValue.context.type).to.eq("fdc3.testReceiver", openDocs);
    //       await closeAppWindows(AOpensBWithContext2Test);
    //     });

    //     const AOpensBWithContext3Test =
    //       "(AOpensBWithContext3) Can open app B from app A with context and AppMetadata (name and appId) as target, app B adds generic listener";
    //     it(AOpensBWithContext3Test, async () => {
    //       await fdc3.joinChannel("FDC3-Conformance-Channel");
    //       const receiver = createReceiver("fdc3-conformance-context-received");
    //       await fdc3.open(
    //         { name: genericListenerAppName, appId: genericListenerAppId },
    //         { name: "context", type: "fdc3.testReceiver" }
    //       );
    //       const receivedValue = (await receiver) as any;
    //       expect(receivedValue.context.name).to.eq("context", openDocs);
    //       expect(receivedValue.context.type).to.eq("fdc3.testReceiver", openDocs);
    //       await closeAppWindows(AOpensBWithContext3Test);
    //     });

    //     const AOpensBWithWrongContextTest =
    //       "(AOpensBWithWrongContext) Receive AppTimeout error when targeting app with wrong context";
    //     it(AOpensBWithWrongContextTest, async () => {
    //       await fdc3.joinChannel("FDC3-Conformance-Channel");
    //       try {
    //         await fdc3.open(
    //           { name: appBName },
    //           { name: "context", type: "fdc3.thisContextDoesNotExist" }
    //         );
    //         assert.fail("No error was not thrown", openDocs);
    //       } catch (ex) {
    //         expect(ex).to.have.property("message", OpenError.AppTimeout, openDocs);
    //       }
    //       await closeAppWindows(AOpensBWithWrongContextTest);
    //     });

    //     const AOpensBNoListenTest =
    //       "(AOpensBNoListen) Receive AppTimeout error when targeting app with no listeners";
    //     it(AOpensBNoListenTest, async () => {
    //       await fdc3.joinChannel("FDC3-Conformance-Channel");
    //       try {
    //         await fdc3.open(
    //           { name: noListenerAppName, appId: noListenerAppId },
    //           { name: "context", type: "fdc3.testReceiver" }
    //         );
    //         assert.fail("No error was not thrown", openDocs);
    //       } catch (ex) {
    //         expect(ex).to.have.property("message", OpenError.AppTimeout, openDocs);
    //       }
    //       await closeAppWindows(AOpensBNoListenTest);
    //     });

    //     const AOpensBMultipleListenTest =
    //       "(AOpensBMultipleListen) Can open app B from app A with context and AppMetadata (name and appId) as target, app B has opened multiple listeners";
    //     it(AOpensBMultipleListenTest, async () => {
    //       await fdc3.joinChannel("FDC3-Conformance-Channel");
    //       const receiver = createReceiver(
    //         "fdc3-conformance-context-received-multiple"
    //       );
    //       await fdc3.open(
    //         { name: appBName, appId: appBId },
    //         { name: "context", type: "fdc3.testReceiverMultiple" }
    //       );
    //       const receivedValue = (await receiver) as any;
    //       expect(receivedValue.context.name).to.eq("context", openDocs);
    //       expect(receivedValue.context.type).to.eq(
    //         "fdc3.testReceiverMultiple",
    //         openDocs
    //       );
    //       await closeAppWindows(AOpensBMultipleListenTest);
    //     });
  });

// creates a channel and subscribes for broadcast contexts. This is
// used by the 'mock app' to send messages back to the test runner for validation
const createReceiver = (contextType: string) => {
  const messageReceived = new Promise<Context>(async (resolve, reject) => {
    const listener = fdc3.addContextListener(contextType, (context) => {
      resolve(context);
      clearTimeout(timeout);
      listener.unsubscribe();
    });

    //if no context received reject promise
    await wait();
    reject(new Error("No context received from app B"));
  });

  return messageReceived;
};

async function closeAppWindows(testId) {
  await broadcastCloseWindow(testId);
  const appControlChannel = await fdc3.getOrCreateChannel("app-control");
  await waitForContext("windowClosed", testId, appControlChannel);
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
          return;
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
              return;
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

async function wait() {
  return new Promise((resolve) => {
    timeout = window.setTimeout(() => {
      resolve(true);
    }, constants.WaitTime);
  });
}

interface AppControlContext extends Context {
  testId: string;
}
