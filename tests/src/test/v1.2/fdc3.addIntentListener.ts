import { Listener } from "@finos/fdc3";
import { assert, expect } from "chai";
import APIDocumentation from "../../apiDocuments";

export default () =>
  describe("fdc3.addIntentListener", () => {
    let listener: Listener;

    afterEach(() => {
      if (listener !== undefined) {
        listener.unsubscribe();
        listener = undefined;
      }
    });

    it("Method is callable", async () => {
      const intentName = "fdc3.conformanceListener";
      try {
        listener = await window.fdc3.addIntentListener(
          intentName,
          (info: any) => {
            console.log(
              `Intent listener for intent ${intentName} triggered with result ${info}`
            );
          }
        );
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
