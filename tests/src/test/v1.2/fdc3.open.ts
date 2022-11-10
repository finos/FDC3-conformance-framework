import { OpenError, Context } from "fdc3_1_2";
import { resolveObjectURL } from "buffer";
import { assert, expect } from "chai";
import APIDocumentation from "../../apiDocuments";
import constants from "../../constants";
import { DesktopAgent } from "../../../../node_modules/fdc3_1_2/dist/api/DesktopAgent";

const appBName = "MockApp";
const appBId = "MockAppId";
let timeout: number;

// creates a channel and subscribes for broadcast contexts. This is
// used by the 'mock app' to send messages back to the test runner for validation
const createReceiver = (contextType: string) => {
  const messageReceived = new Promise<Context>(async (resolve, reject) => {
    await (<DesktopAgent>(<unknown>window.fdc3)).getOrCreateChannel(
      "FDC3-Conformance-Channel"
    );
    await (<DesktopAgent>(<unknown>window.fdc3)).joinChannel(
      "FDC3-Conformance-Channel"
    );

    const listener = await (<DesktopAgent>(
      (<unknown>window.fdc3)
    )).addContextListener(contextType, (context) => {
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
      await (<DesktopAgent>(<unknown>window.fdc3)).open(appBName);
      await result;
    });

    it("(AOpensB2) Can open app B from app A with no context and AppMetadata (name) as target", async () => {
      const result = createReceiver("fdc3-conformance-opened");
      await (<DesktopAgent>(<unknown>window.fdc3)).open({ name: appBName });
      await result;
    });

    it("(AOpensB3) Can open app B from app A with no context and AppMetadata (name and appId) as target", async () => {
      const result = createReceiver("fdc3-conformance-opened");
      await (<DesktopAgent>(<unknown>window.fdc3)).open({
        name: appBName,
        appId: appBId,
      });
      await result;
    });

    it("(AFailsToOpenB1) Receive AppNotFound error when targeting non-existent app name as target", async () => {
      try {
        await (<DesktopAgent>(<unknown>window.fdc3)).open(
          "ThisAppDoesNotExist"
        );
        assert.fail("No error was not thrown", openDocs);
      } catch (ex) {
        expect(ex).to.have.property("message", OpenError.AppNotFound, openDocs);
      }
    });

    it("(AFailsToOpenB2) Receive AppNotFound error when targeting non-existent app AppMetadata (name) as target", async () => {
      try {
        await (<DesktopAgent>(<unknown>window.fdc3)).open({
          name: "ThisAppDoesNotExist",
        });
        assert.fail("No error was not thrown", openDocs);
      } catch (ex) {
        expect(ex).to.have.property("message", OpenError.AppNotFound, openDocs);
      }
    });

    it("(AFailsToOpenB3) Receive AppNotFound error when targeting non-existent app AppMetadata (name and appId) as target", async () => {
      try {
        await (<DesktopAgent>(<unknown>window.fdc3)).open({
          name: "ThisAppDoesNotExist",
          appId: "ThisAppDoesNotExist",
        });
        assert.fail("No error was not thrown", openDocs);
      } catch (ex) {
        expect(ex).to.have.property("message", OpenError.AppNotFound, openDocs);
      }
    });

    it("(AOpensBWithContext2) Can open app B from app A with context and AppMetadata (name) as target", async () => {
      const receiver = createReceiver("fdc3-conformance-context-received");
      await (<DesktopAgent>(<unknown>window.fdc3)).open(
        { name: appBName },
        { name: "context", type: "fdc3.testReceiver" }
      );
      const receivedValue = (await receiver) as any;
      expect(receivedValue.context.name).to.eq("context", openDocs);
      expect(receivedValue.context.type).to.eq("fdc3.testReceiver", openDocs);
    });
  });
