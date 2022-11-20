import { Listener } from "fdc3_2_0";
import { assert, expect } from "chai";
import APIDocumentation from "../../../apiDocuments";
import { DesktopAgent } from "fdc3_2_0/dist/api/DesktopAgent";

declare let fdc3: DesktopAgent;

export default () =>
  describe("fdc3.addIntentListener", () => {
    let listener: Listener;

    afterEach(() => {
      if (listener !== undefined) {
        listener.unsubscribe();
        listener = undefined;
      }
    });

    it("(2.0-BasicIL1) Method is callable", async () => {
      const intentName = "fdc3.conformanceListener";
      try {
        listener = await fdc3.addIntentListener(intentName, (info: any) => {
          console.log(
            `Intent listener for intent ${intentName} triggered with result ${info}`
          );
        });
        expect(listener).to.have.property("unsubscribe").that.is.a("function");
      } catch (ex) {
        assert.fail(
          "\r\nDocumentation: " +
            APIDocumentation.addIntentListener +
            "\r\nCause" +
            (ex.message ?? ex)
        );
      }
    });
  });
