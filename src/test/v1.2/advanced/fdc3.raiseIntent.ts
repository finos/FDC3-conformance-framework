import {
  AppMetadata,
  Channel,
  Context,
  getOrCreateChannel,
  IntentResolution,
  Listener,
  ResolveError,
} from "fdc3_1_2";
import { assert, expect } from "chai";
import APIDocumentation from "../../../apiDocuments";
import constants from "../../../constants";
import { DesktopAgent } from "fdc3_1_2/dist/api/DesktopAgent";
import { sleep, wait } from "../../../utils";

declare let fdc3: DesktopAgent;
const raiseIntentDocs =
  "\r\nDocumentation: " + APIDocumentation.raiseIntent + "\r\nCause";

/**
 * Details on the mock apps used in these tests can be found in /mock/README.md
 */
export default () =>
  describe("fdc3.raiseIntent", () => {
    afterEach(async function afterEach() {
      await closeIntentAppsWindows(this.currentTest.title);
    });

    const test1 =
      "(SingleResolve1) Should start app intent-b when raising intent 'sharedTestingIntent1' with context 'testContextY'";
    it(test1, async () => {
      const result = createReceiver("fdc3-intent-b-opened");
      console.log("receiver added");
      const intentResolution = await fdc3.raiseIntent("sharedTestingIntent1", {
        type: "testContextY",
      });

      validateIntentResolution("IntentAppB", intentResolution);
      await result;
    });

    const test2 =
      "(TargetedResolve1) Should start app intent-a when targeted by raising intent 'aTestingIntent' with context 'testContextX'";
    it(test2, async () => {
      const result = createReceiver("fdc3-intent-a-opened");
      const intentResolution = await fdc3.raiseIntent(
        "aTestingIntent",
        {
          type: "testContextX",
        },
        "IntentAppA"
      );
      validateIntentResolution("IntentAppA", intentResolution);
      await result;
    });

    const test3 =
      "(TargetedResolve2) Should start app intent-a when targeted (name) by raising intent 'aTestingIntent' with context 'testContextX'";
    it(test3, async () => {
      const result = createReceiver("fdc3-intent-a-opened");
      const intentResolution = await fdc3.raiseIntent(
        "aTestingIntent",
        {
          type: "testContextX",
        },
        { name: "IntentAppA" }
      );

      validateIntentResolution("IntentAppA", intentResolution);
      await result;
    });

    const test4 =
      "(TargetedResolve3) Should start app intent-a when targeted (name and appId) by raising intent 'aTestingIntent' with context 'testContextX'";
    it(test4, async () => {
      const result = createReceiver("fdc3-intent-a-opened");
      const intentResolution = await fdc3.raiseIntent(
        "aTestingIntent",
        {
          type: "testContextX",
        },
        { name: "IntentAppA", appId: "IntentAppAId" }
      );
      validateIntentResolution("IntentAppA", intentResolution);
      await result;
    });

    const test5 =
      "(FailedResolve1) Should fail to raise intent when targeted app intent-a, context 'testContextY' and intent 'aTestingIntent' do not correlate";
    it(test5, async () => {
      try {
        await fdc3.raiseIntent(
          "aTestingIntent",
          {
            type: "testContextY",
          },
          "IntentAppA"
        );
        assert.fail("Error was not thrown");
      } catch (ex) {
        expect(ex).to.have.property("message", ResolveError.NoAppsFound);

        //raise intent so that afterEach resolves
        await fdc3.raiseIntent("sharedTestingIntent1", {
          type: "testContextY",
        });
      }
    });
    const test6 =
      "(FailedResolve2) Should fail to raise intent when targeted app intent-a (name and appId), context 'testContextY' and intent 'aTestingIntent' do not correlate";
    it(test6, async () => {
      try {
        await fdc3.raiseIntent(
          "aTestingIntent",
          {
            type: "testContextY",
          },
          { name: "IntentAppA", appId: "IntentAppAId" }
        );
        assert.fail("Error was not thrown", raiseIntentDocs);
      } catch (ex) {
        expect(ex).to.have.property(
          "message",
          ResolveError.NoAppsFound,
          raiseIntentDocs
        );

        //raise intent so that afterEach resolves
        await fdc3.raiseIntent("sharedTestingIntent1", {
          type: "testContextY",
        });
      }
    });

    const test7 =
      "(FailedResolve3) Should fail to raise intent when targeted app intent-a (name), context 'testContextY' and intent 'aTestingIntent' do not correlate";
    it(test7, async () => {
      try {
        await fdc3.raiseIntent(
          "aTestingIntent",
          {
            type: "testContextY",
          },
          { name: "IntentAppA" }
        );
        assert.fail("Error was not thrown", raiseIntentDocs);
      } catch (ex) {
        expect(ex).to.have.property(
          "message",
          ResolveError.NoAppsFound,
          raiseIntentDocs
        );

        //raise intent so that afterEach resolves
        await fdc3.raiseIntent("sharedTestingIntent1", {
          type: "testContextY",
        });
      }
    });

    const test8 =
      "(FailedResolve4) Should fail to raise intent when targeted app intent-c, context 'testContextX' and intent 'aTestingIntent' do not correlate";
    it(test8, async () => {
      try {
        await fdc3.raiseIntent(
          "aTestingIntent",
          {
            type: "testContextX",
          },
          "IntentAppC"
        );
        assert.fail("Error was not thrown", raiseIntentDocs);
      } catch (ex) {
        expect(ex).to.have.property(
          "message",
          ResolveError.NoAppsFound,
          raiseIntentDocs
        );

        //raise intent so that afterEach resolves
        await fdc3.raiseIntent("sharedTestingIntent1", {
          type: "testContextY",
        });
      }
    });
  });

const validateIntentResolution = (
  appName: string,
  intentResolution: IntentResolution
) => {
  if (typeof intentResolution.source === "string") {
    expect(intentResolution.source).to.eq(appName, raiseIntentDocs);
  } else if (typeof intentResolution.source === "object") {
    expect((intentResolution.source as AppMetadata).name).to.eq(
      appName,
      raiseIntentDocs
    );
  } else assert.fail("Invalid intent resolution object");
};

const broadcastCloseWindow = async (currentTest) => {
  const appControlChannel = await fdc3.getOrCreateChannel("app-control");
  appControlChannel.broadcast({
    type: "closeWindow",
    testId: currentTest,
  } as AppControlContext);
};

// creates a channel and subscribes for broadcast contexts. This is
// used by the 'mock app' to send messages back to the test runner for validation
const createReceiver = async (contextType: string) => {
  let timeout;
  const appControlChannel = await getOrCreateChannel("app-control");
  const messageReceived = new Promise<Context>(async (resolve, reject) => {
    const listener = appControlChannel.addContextListener(contextType, (context) => {
      resolve(context);
      clearTimeout(timeout);
      listener.unsubscribe();
    });

    //if no context received reject promise
    const { promise: sleepPromise, timeout: theTimeout } = sleep();
    timeout = theTimeout;
    await sleepPromise;
    reject(new Error("No context received from app B"));
  });

  return messageReceived;
};

async function closeIntentAppsWindows(testId) {
  await broadcastCloseWindow(testId);
  const appControlChannel = await fdc3.getOrCreateChannel("app-control");
  await waitForContext("windowClosed", testId, appControlChannel);
  await wait(constants.WindowCloseWaitTime);
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
      if (testId) {
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
and type "${context?.type}" (${
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
