import { OpenError, Context } from "fdc3_1_2";
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

// creates a channel and subscribes for broadcast contexts. This is
// used by the 'mock app' to send messages back to the test runner for validation
const createReceiver = (contextType: string) => {
  const messageReceived = new Promise<Context>(async (resolve, reject) => {
    await fdc3.getOrCreateChannel("FDC3-Conformance-Channel");
    await fdc3.joinChannel("FDC3-Conformance-Channel");

    const listener = fdc3.addContextListener(contextType, (context) => {
      resolve(context);
      clearTimeout(timeout);
      listener.unsubscribe();
    });

    //reject promise if no context received
    await wait();
    reject(new Error("No context received from app B"));
  });

  return messageReceived;
};

async function wait() {
  return new Promise((resolve) => {
    timeout = window.setTimeout(() => {
      resolve(true);
    }, constants.WaitTime);
  });
}

const openDocs = "\r\nDocumentation: " + APIDocumentation.open + "\r\nCause";

/**
 * Details on the mock apps used in these tests can be found in /mock/README.md
 */
export default () =>
  describe("fdc3.open", () => {
    it("(AOpensB1) Can open app B from app A with no context and string as target", async () => {
      const result = createReceiver("fdc3-conformance-opened");
      await fdc3.open(appBName);
      await result;
    });

    it("(AOpensB2) Can open app B from app A with no context and AppMetadata (name) as target", async () => {
      const result = createReceiver("fdc3-conformance-opened");
      await fdc3.open({ name: appBName });
      await result;
    });

    it("(AOpensB3) Can open app B from app A with no context and AppMetadata (name and appId) as target", async () => {
      const result = createReceiver("fdc3-conformance-opened");
      await fdc3.open({
        name: appBName,
        appId: appBId,
      });
      await result;
    });

    it("(AFailsToOpenB1) Receive AppNotFound error when targeting non-existent app name as target", async () => {
      try {
        await fdc3.open("ThisAppDoesNotExist");
        assert.fail("No error was not thrown", openDocs);
      } catch (ex) {
        expect(ex).to.have.property("message", OpenError.AppNotFound, openDocs);
      }
    });

    it("(AFailsToOpenB2) Receive AppNotFound error when targeting non-existent app AppMetadata (name) as target", async () => {
      try {
        await fdc3.open({
          name: "ThisAppDoesNotExist",
        });
        assert.fail("No error was not thrown", openDocs);
      } catch (ex) {
        expect(ex).to.have.property("message", OpenError.AppNotFound, openDocs);
      }
    });

    it("(AFailsToOpenB3) Receive AppNotFound error when targeting non-existent app AppMetadata (name and appId) as target", async () => {
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
    it("(AOpensBWithSpecificContext1) Can open app B from app A with context and string as target, app B adds specific listener", async () => {
      const receiver = createReceiver("fdc3-conformance-context-received");
      await fdc3.open(appBName, {
        name: "context",
        type: "fdc3.testReceiver",
      });
      const receivedValue = (await receiver) as any;
      expect(receivedValue.context.name).to.eq("context", openDocs);
      expect(receivedValue.context.type).to.eq("fdc3.testReceiver", openDocs);
    });

    it("(AOpensBWithSpecificContext2) Can open app B from app A with context and AppMetadata (name) as target, app B adds specific listener", async () => {
      const receiver = createReceiver("fdc3-conformance-context-received");
      await fdc3.open(
        { name: appBName },
        { name: "context", type: "fdc3.testReceiver" }
      );
      const receivedValue = (await receiver) as any;
      expect(receivedValue.context.name).to.eq("context", openDocs);
      expect(receivedValue.context.type).to.eq("fdc3.testReceiver", openDocs);
    });
    it("(AOpensBWithSpecificContext3) Can open app B from app A with context and AppMetadata (name and appId) as target, app B adds specific listener", async () => {
      const receiver = createReceiver("fdc3-conformance-context-received");
      await fdc3.open(
        { name: appBName, appId: appBId },
        { name: "context", type: "fdc3.testReceiver" }
      );
      const receivedValue = (await receiver) as any;
      expect(receivedValue.context.name).to.eq("context", openDocs);
      expect(receivedValue.context.type).to.eq("fdc3.testReceiver", openDocs);
    });

    it("(AOpensBWithContext1) Can open app B from app A with context and string as target, app B adds generic listener", async () => {
      const receiver = createReceiver("fdc3-conformance-context-received");
      await fdc3.open(genericListenerAppName, {
        name: "context",
        type: "fdc3.testReceiver",
      });
      const receivedValue = (await receiver) as any;
      expect(receivedValue.context.name).to.eq("context", openDocs);
      expect(receivedValue.context.type).to.eq("fdc3.testReceiver", openDocs);
    });
    it("(AOpensBWithContext2) Can open app B from app A with context and AppMetadata (name) as target, app B adds generic listener", async () => {
      const receiver = createReceiver("fdc3-conformance-context-received");
      await fdc3.open(
        { name: genericListenerAppName },
        { name: "context", type: "fdc3.testReceiver" }
      );
      const receivedValue = (await receiver) as any;
      expect(receivedValue.context.name).to.eq("context", openDocs);
      expect(receivedValue.context.type).to.eq("fdc3.testReceiver", openDocs);
    });
    it("(AOpensBWithContext3) Can open app B from app A with context and AppMetadata (name and appId) as target, app B adds generic listener", async () => {
      const receiver = createReceiver("fdc3-conformance-context-received");
      await fdc3.open(
        { name: genericListenerAppName, appId: genericListenerAppId },
        { name: "context", type: "fdc3.testReceiver" }
      );
      const receivedValue = (await receiver) as any;
      expect(receivedValue.context.name).to.eq("context", openDocs);
      expect(receivedValue.context.type).to.eq("fdc3.testReceiver", openDocs);
    });

    it("(AOpensBWithWrongContext) Receive AppTimeout error when targeting app with wrong context", async () => {
      try {
        await fdc3.open(
          { name: appBName },
          { name: "context", type: "fdc3.thisContextDoesNotExist" }
        );
        assert.fail("No error was not thrown", openDocs);
      } catch (ex) {
        expect(ex).to.have.property("message", OpenError.AppTimeout, openDocs);
      }
    });

    it("(AOpensBNoListen) Receive AppTimeout error when targeting app with no listeners", async () => {
      try {
        await fdc3.open(
          { name: noListenerAppName, appId: noListenerAppId },
          { name: "context", type: "fdc3.testReceiver" }
        );
        assert.fail("No error was not thrown", openDocs);
      } catch (ex) {
        expect(ex).to.have.property("message", OpenError.AppTimeout, openDocs);
      }
    });

    it("(AOpensBMultipleListen) Can open app B from app A with context and AppMetadata (name and appId) as target, app B has opened multiple listeners", async () => {
      const receiver = createReceiver(
        "fdc3-conformance-context-received-multiple"
      );
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
    });
  });
