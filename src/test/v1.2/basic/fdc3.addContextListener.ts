import { Listener } from "fdc3_1_2";
import { assert, expect } from "chai";
import APIDocumentation from "../../../apiDocuments";
import { DesktopAgent } from "fdc3_1_2/dist/api/DesktopAgent";

declare let fdc3: DesktopAgent;
const documentation =
  "\r\nDocumentation: " + APIDocumentation.addContextListener + "\r\nCause";

export default () =>
  describe("fdc3.addContextListener", () => {
    let listener: Listener;

    afterEach(() => {
      if (listener !== undefined) {
        listener.unsubscribe();
        listener = undefined;
      }
    });

    it("(BasicCL1) Method is callable", async () => {
      const contextType = "fdc3.contact";
      try {
        listener = fdc3.addContextListener(contextType, (info: any) => {
          console.log(
            `Context listener of type ${contextType} triggered with result ${info}`
          );
        });
      } catch (ex) {
        assert.fail(documentation + (ex.message ?? ex));
      }
    });

    it("(BasicCL2) Returns listener object", async () => {
      try {
        listener = fdc3.addContextListener(null, () => {});
        assert.isTrue(listener && typeof listener === "object", documentation);
        expect(typeof listener.unsubscribe, documentation).to.be.equals(
          "function"
        );
      } catch (ex) {
        assert.fail(documentation + (ex.message ?? ex));
      }
    });
  });
