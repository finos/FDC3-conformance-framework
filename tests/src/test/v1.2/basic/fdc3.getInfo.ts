import { assert, expect } from "chai";
import APIDocumentation from "../../../apiDocuments";
import { DesktopAgent } from "fdc3_1_2/dist/api/DesktopAgent";

const getInfoDocs =
  "\r\nDocumentation: " + APIDocumentation.getInfo + "\r\nCause";

export default () =>
  describe("fdc3.getInfo", () => {
    it("Method is callable", async () => {
      try {
        (<DesktopAgent>(<unknown>window.fdc3)).getInfo();
      } catch (ex) {
        assert.fail(
          "\r\nDocumentation: " +
            APIDocumentation.getInfo +
            "\r\nCause" +
            (ex.message ?? ex)
        );
      }
    });

    it("Returns ImplementationMetadata object", async () => {
      try {
        const info = (<DesktopAgent>(<unknown>window.fdc3)).getInfo();
        expect(info, getInfoDocs).to.have.property("fdc3Version");
        expect(info, getInfoDocs).to.have.property("provider");
      } catch (ex) {
        assert.fail(getInfoDocs + (ex.message ?? ex));
      }
    });
  });
