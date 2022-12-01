import { Listener } from "fdc3_1_2";
import { assert, expect } from "chai";
import { DesktopAgent } from "fdc3_1_2/dist/api/DesktopAgent";
import { APIDocumentation1_2 } from "../apiDocuments-1.2";

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

    it("(BasicIL1) Method is callable", async () => {
      const intentName = "fdc3.conformanceListener";
      try {
        listener = fdc3.addIntentListener(intentName, (info: any) => {
          console.log(
            `Intent listener for intent ${intentName} triggered with result ${info}`
          );
        });
        expect(listener).to.have.property("unsubscribe").that.is.a("function");
      } catch (ex) {
        assert.fail(
          "\r\nDocumentation: " +
            APIDocumentation1_2.addIntentListener +
            "\r\nCause" +
            (ex.message ?? ex)
        );
      }
    });
  });
