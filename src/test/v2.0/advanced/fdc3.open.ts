import { OpenError, Listener, Channel, Context, getOrCreateChannel } from "fdc3_2_0";
import { assert, expect } from "chai";
import constants from "../../../constants";
import APIDocumentation from "../../../apiDocuments";
import { DesktopAgent } from "fdc3_2_0/dist/api/DesktopAgent";
import { sleep, wait } from "../../../utils";

declare let fdc3: DesktopAgent;
const openDocs = "\r\nDocumentation: " + APIDocumentation.open + "\r\nCause:";

interface AppControlContext extends Context {
  testId: string;
}

const appBId = "MockAppId";
const genericListenerAppId = "IntentAppCId";

export default () =>
  describe("fdc3.open", () => {
    it("(AOpensB1) Can open app B from app A with AppIdentifier (appId) as target", async () => {
      const result = createReceiver("fdc3-conformance-opened");
      await fdc3.open({ appId: appBId });
      await result;
      await broadcastCloseWindow();
      await waitForMockAppToClose();
    });

    it("(AFailsToOpenB) Receive AppNotFound error when targeting non-existent AppIdentifier (appId) as target", async () => {
      try {
        await fdc3.open({ appId: "ThisAppDoesNotExist" });
        assert.fail("No error was not thrown", openDocs);
      } catch (ex) {
        expect(ex).to.have.property("message", OpenError.AppNotFound, openDocs);
      }
    });

    it("(AOpensBWithContext) Can open app B from app A with context and AppIdentifier (appId) as target but app B listening for null context", async () => {
      const receiver = createReceiver("fdc3-conformance-opened");
      await fdc3.open(
        { appId: genericListenerAppId },
        { name: "context", type: "fdc3.testReceiver" }
      );
      const receivedValue = (await receiver) as any;
      expect(receivedValue.context.name).to.eq("context", openDocs);
      expect(receivedValue.context.type).to.eq("fdc3.testReceiver", openDocs);
      await broadcastCloseWindow();
      await waitForMockAppToClose();
    });

    it("(AOpensBWithSpecificContext) Can open app B from app A with context and AppIdentifier (appId) as target and app B is expecting context", async () => {
      const receiver = createReceiver("fdc3-conformance-context-received");
      await fdc3.open(
        { appId: appBId },
        { name: "context", type: "fdc3.testReceiver" }
      );
      const receivedValue = (await receiver) as any;
      expect(receivedValue.context.name).to.eq("context", openDocs);
      expect(receivedValue.context.type).to.eq(
        "fdc3.testReceiver",
        openDocs
      );
      await broadcastCloseWindow();
      await waitForMockAppToClose();
    });

    it("(AOpensBMultipleListen) Can open app B from app A with context and AppIdentifier (appId) as target but app B add listener before correct one", async () => {
      const receiver = createReceiver(
        "fdc3-conformance-context-received-multiple"
      );
      await fdc3.open(
        { appId: appBId },
        { name: "context", type: "fdc3.testReceiverMultiple" }
      );

      const receivedValue = (await receiver) as any;
      expect(receivedValue.context.name).to.eq("context", openDocs);
      expect(receivedValue.context.type).to.eq(
        "fdc3.testReceiverMultiple",
        openDocs
      );
      await broadcastCloseWindow();
      await waitForMockAppToClose();
    });

    it("(AOpensBNoListen) Received App time out when opening app B with fake context, app b not listening for any context", async () => {
      try {
        await fdc3.open(
          { appId: appBId },
          { name: "context", type: "fdc3.contextDoesNotExist" }
        );
        assert.fail("No error was not thrown", openDocs);
      } catch (ex) {
        expect(ex).to.have.property("message", OpenError.AppTimeout, openDocs);
      }
    });

    it("(AOpensBWithWrongContext) Received App time out when opening app B with fake context, app b listening for different context", async () => {
      try {
        await fdc3.open(
          { appId: appBId },
          { name: "context", type: "fdc3.contextDoesNotExist" }
        );
        assert.fail("No error was not thrown", openDocs);
      } catch (ex) {
        expect(ex).to.have.property("message", OpenError.AppTimeout, openDocs);
      }
    });
  });

// creates a channel and subscribes for broadcast contexts. This is
// used by the 'mock app' to send messages back to the test runner for validation
const createReceiver = async (contextType: string) => {
  const appControlChannel = await getOrCreateChannel("app-control");
  let timeout;
  const messageReceived = new Promise<Context>(async (resolve, reject) => {
    const listener = await appControlChannel.addContextListener(contextType, async (context) => {
      resolve(context);
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

const broadcastCloseWindow = async () => {
  const appControlChannel = await fdc3.getOrCreateChannel("app-control");
  await appControlChannel.broadcast({ type: "closeWindow" });
};

async function waitForMockAppToClose() {
  let timeout;
  const messageReceived = new Promise<Context>(async (resolve, reject) => {
    const appControlChannel = await fdc3.getOrCreateChannel("app-control");
    const listener = await appControlChannel.addContextListener(
      "windowClosed",
      (context) => {
        resolve(context);
        clearTimeout(timeout);
        listener.unsubscribe();
      }
    );

    //if no context received reject promise
    const { promise: sleepPromise, timeout: theTimeout } = sleep();
    timeout = theTimeout;
    await sleepPromise;
    reject(new Error("windowClosed context not received from app B"));
  });

  return messageReceived;
}