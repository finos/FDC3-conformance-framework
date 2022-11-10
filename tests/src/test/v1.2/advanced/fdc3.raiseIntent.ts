import {
  AppMetadata,
  Channel,
  Context,
  IntentResolution,
  raiseIntent,
  ResolveError,
} from "fdc3_1_2";
import { assert, expect } from "chai";
import APIDocumentation from "../../../apiDocuments";
import constants from "../../../constants";
import { DesktopAgent } from "fdc3_1_2/dist/api/DesktopAgent";

let timeout: number;

const raiseIntentDocs =
  "\r\nDocumentation: " + APIDocumentation.raiseIntent + "\r\nCause";

/**
 * Details on the mock apps used in these tests can be found in /mock/README.md
 */
export default () =>
  describe("fdc3.raiseIntent", () => {
    before(async () => {
      await (<DesktopAgent>(<unknown>window.fdc3)).getOrCreateChannel(
        "fdc3.raiseIntent"
      );
      await (<DesktopAgent>(<unknown>window.fdc3)).joinChannel(
        "fdc3.raiseIntent"
      );
    });

    afterEach(async () => {
      await broadcastCloseWindow();
      await waitForMockAppToClose();
    });

    it("(SingleResolve1) Should start app intent-b when raising intent 'sharedTestingIntent1' with context 'testContextY'", async () => {
      const result = createReceiver("fdc3-intent-b-opened");
      const intentResolution = await (<DesktopAgent>(
        (<unknown>window.fdc3)
      )).raiseIntent("sharedTestingIntent1", {
        type: "testContextY",
      });

      validateIntentResolution("IntentAppB", intentResolution);
      await result;
    });

    it("(TargetedResolve1) Should start app intent-a when targeted by raising intent 'aTestingIntent' with context 'testContextX'", async () => {
      const result = createReceiver("fdc3-intent-a-opened");
      const intentResolution = await (<DesktopAgent>(
        (<unknown>window.fdc3)
      )).raiseIntent(
        "aTestingIntent",
        {
          type: "testContextX",
        },
        "IntentAppA"
      );
      validateIntentResolution("IntentAppA", intentResolution);
      await result;
    });

    it("(TargetedResolve2) Should start app intent-a when targeted (name) by raising intent 'aTestingIntent' with context 'testContextX'", async () => {
      const result = createReceiver("fdc3-intent-a-opened");
      const intentResolution = await (<DesktopAgent>(
        (<unknown>window.fdc3)
      )).raiseIntent(
        "aTestingIntent",
        {
          type: "testContextX",
        },
        { name: "IntentAppA" }
      );

      validateIntentResolution("IntentAppA", intentResolution);
      await result;
    });

    it("(TargetedResolve3) Should start app intent-a when targeted (name and appId) by raising intent 'aTestingIntent' with context 'testContextX'", async () => {
      const result = createReceiver("fdc3-intent-a-opened");
      const intentResolution = await (<DesktopAgent>(
        (<unknown>window.fdc3)
      )).raiseIntent(
        "aTestingIntent",
        {
          type: "testContextX",
        },
        { name: "IntentAppA", appId: "IntentAppAId" }
      );
      validateIntentResolution("IntentAppA", intentResolution);
      await result;
    });

    it("(FailedResolve1) Should fail to raise intent when targeted app intent-a, context 'testContextY' and intent 'aTestingIntent' do not correlate", async () => {
      try {
        await (<DesktopAgent>(<unknown>window.fdc3)).raiseIntent(
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
        await (<DesktopAgent>(<unknown>window.fdc3)).raiseIntent(
          "sharedTestingIntent1",
          {
            type: "testContextY",
          }
        );
      }
    });

    it("(FailedResolve2) )Should fail to raise intent when targeted app intent-a (name), context 'testContextY' and intent 'aTestingIntent' do not correlate", async () => {
      try {
        await (<DesktopAgent>(<unknown>window.fdc3)).raiseIntent(
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
        await (<DesktopAgent>(<unknown>window.fdc3)).raiseIntent(
          "sharedTestingIntent1",
          {
            type: "testContextY",
          }
        );
      }
    });

    it("(FailedResolve3) Should fail to raise intent when targeted app intent-a (name and appId), context 'testContextY' and intent 'aTestingIntent' do not correlate", async () => {
      try {
        await (<DesktopAgent>(<unknown>window.fdc3)).raiseIntent(
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
        await (<DesktopAgent>(<unknown>window.fdc3)).raiseIntent(
          "sharedTestingIntent1",
          {
            type: "testContextY",
          }
        );
      }
    });

    it("(FailedResolve4) Should fail to raise intent when targeted app intent-c, context 'testContextX' and intent 'aTestingIntent' do not correlate", async () => {
      try {
        await (<DesktopAgent>(<unknown>window.fdc3)).raiseIntent(
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
        await (<DesktopAgent>(<unknown>window.fdc3)).raiseIntent(
          "sharedTestingIntent1",
          {
            type: "testContextY",
          }
        );
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

async function wait() {
  return new Promise((resolve) => {
    timeout = window.setTimeout(() => {
      resolve(true);
    }, constants.WaitTime);
  });
}

const broadcastCloseWindow = async () => {
  const appControlChannel = await (<DesktopAgent>(
    (<unknown>window.fdc3)
  )).getOrCreateChannel("app-control");
  await appControlChannel.broadcast({ type: "closeWindow" });
};

// creates a channel and subscribes for broadcast contexts. This is
// used by the 'mock app' to send messages back to the test runner for validation
const createReceiver = (contextType: string) => {
  const messageReceived = new Promise<Context>(async (resolve, reject) => {
    const listener = await (<DesktopAgent>(
      (<unknown>window.fdc3)
    )).addContextListener(contextType, (context) => {
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

async function waitForMockAppToClose() {
  const messageReceived = new Promise<Context>(async (resolve, reject) => {
    const appControlChannel = await (<DesktopAgent>(
      (<unknown>window.fdc3)
    )).getOrCreateChannel("app-control");
    const listener = await appControlChannel.addContextListener(
      "windowClosed",
      (context) => {
        resolve(context);
        clearTimeout(timeout);
        listener.unsubscribe();
      }
    );

    //if no context received reject promise
    await wait();
    reject(new Error("windowClosed context not received from app B"));
  });

  return messageReceived;
}
