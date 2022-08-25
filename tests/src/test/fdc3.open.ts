import { OpenError } from "@finos/fdc3";
import { assert, expect } from "chai";

const appBName = "MockApp";
const appBId = "MockAppId";

export default () =>
  describe("fdc3.open", () => {
    it("Can open app B from app A with no context and string as target", async () => {
      await window.fdc3.open(appBName);
    });

    it("Can open app B from app A with no context and AppMetadata (name) as target", async () => {
      await window.fdc3.open({ name: appBName });
    });

    it("Can open app B from app A with no context and AppMetadata (name and appId) as target", async () => {
      await window.fdc3.open({ name: appBName, appId: appBId });
    });

    it("Can open app B from app A with no context and AppMetadata (appId) as target", async () => {
      await window.fdc3.open({ appId: appBId } as any);
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

    it("Receive AppNotFound error when targeting non-existent app AppMetadata (appId) as target", async () => {
      try {
        await window.fdc3.open({ appId: "ThisAppDoesNotExist" } as any);
        assert.fail("No error was not thrown");
      } catch (ex) {
        const exception = ex.message ?? ex;
        expect(exception).to.eq(OpenError.AppNotFound);
      }
    });

    it("Can open app B from app A with context and AppMetadata (name) as target", async () => {
      await window.fdc3.open(
        { name: appBName },
        { name: "context", type: "fdc3.testReceiver" }
      );
    });

    it("Can open app B from app A with invalid context and AppMetadata (name) as target", async () => {
      const malformedContext = {} as any;
      await window.fdc3.open({ name: appBName }, malformedContext);
    });
  });
