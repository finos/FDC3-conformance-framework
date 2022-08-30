import { OpenError, Context } from "@finos/fdc3";
import { assert, expect } from "chai";

const appBName = "MockApp";
const appBId = "MockAppId";

// creates a channel and subscribes for broadcast contexts. This is
// used by the 'mock app' to send messages back to the test runner for validation
const createReceiver = (contextType: string) => {
  const messageReceived = new Promise<Context>(async (resolve) => {
    await window.fdc3.getOrCreateChannel("FDC3-Conformance-Channel");
    await window.fdc3.joinChannel("FDC3-Conformance-Channel");

    const listener = await window.fdc3.addContextListener(
      contextType,
      (context) => {
        resolve(context);
        listener.unsubscribe();
      }
    );
  });

  return messageReceived;
};

export default () =>
  describe("fdc3.open", () => {
    it("Can open app B from app A with no context and string as target", async () => {
      const result = createReceiver("fdc3-conformance-opened");

      await window.fdc3.open(appBName);

      await result;
    });

    it("Can open app B from app A with no context and AppMetadata (name) as target", async () => {
      const result = createReceiver("fdc3-conformance-opened");

      await window.fdc3.open({ name: appBName });

      await result;
    });

    it("Can open app B from app A with no context and AppMetadata (name and appId) as target", async () => {
      const result = createReceiver("fdc3-conformance-opened");

      await window.fdc3.open({ name: appBName, appId: appBId });

      await result;
    });

    it("Receive AppNotFound error when targeting non-existent app name as target", async () => {
      try {
        await window.fdc3.open("ThisAppDoesNotExist");
        assert.fail("No error was not thrown");
      } catch (ex) {
        const exception = ex.message ?? ex;
        expect(exception).to.eq(OpenError.AppNotFound);
      }
    });

    it("Receive AppNotFound error when targeting non-existent app AppMetadata (name) as target", async () => {
      try {
        await window.fdc3.open({ name: "ThisAppDoesNotExist" });
        assert.fail("No error was not thrown");
      } catch (ex) {
        const exception = ex.message ?? ex;
        expect(exception).to.eq(OpenError.AppNotFound);
      }
    });

    it("Receive AppNotFound error when targeting non-existent app AppMetadata (name and appId) as target", async () => {
      try {
        await window.fdc3.open({
          name: "ThisAppDoesNotExist",
          appId: "ThisAppDoesNotExist",
        });
        assert.fail("No error was not thrown");
      } catch (ex) {
        const exception = ex.message ?? ex;
        expect(exception).to.eq(OpenError.AppNotFound);
      }
    });

    it("Can open app B from app A with context and AppMetadata (name) as target", async () => {
      const receiver = createReceiver("fdc3-conformance-context-received");

      await window.fdc3.open(
        { name: appBName },
        { name: "context", type: "fdc3.testReceiver" }
      );

      const receivedValue = (await receiver) as any;
      expect(receivedValue.context.name).to.eq("context");
      expect(receivedValue.context.type).to.eq("fdc3.testReceiver");
    });

    it("Can open app B from app A with invalid context and AppMetadata (name) as target", async () => {
      const receiver = createReceiver("fdc3-conformance-context-received");

      const malformedContext = {} as any;
      await window.fdc3.open({ name: appBName }, malformedContext);

      await receiver;
    });
  });
