import { ResolveError } from "fdc3_1_2";
import { assert, expect } from "chai";
import APIDocumentation from "../../../apiDocuments";
import { DesktopAgent } from "fdc3_1_2/dist/api/DesktopAgent";

declare let fdc3: DesktopAgent;
const docs =
  "\r\nDocumentation: " +
  APIDocumentation.raiseIntentForContext +
  "\r\nCause: ";

export default () =>
  describe("fdc3.raiseIntentForContext", async () => {
    it("(BasicRI1) Passing an invalid context causes a NoAppsFound error to be thrown", async () => {
      const context = {
        type: "ThisContextDoesNotExist",
      };

      try {
        await fdc3.raiseIntentForContext(context);
        assert.fail("Expected error NoAppsFound not thrown", docs);
      } catch (ex) {
        expect(ex).to.have.property("message", ResolveError.NoAppsFound, docs);
      }
    });
  });
