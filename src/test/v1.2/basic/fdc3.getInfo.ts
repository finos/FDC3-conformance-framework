import { assert, expect } from "chai";
import APIDocumentation from "../../../apiDocuments";
import { DesktopAgent } from "fdc3_1_2/dist/api/DesktopAgent";

declare let fdc3: DesktopAgent;
const getInfoDocs =
  "\r\nDocumentation: " + APIDocumentation.getInfo + "\r\nCause";

export default () =>
  describe("fdc3.getInfo", () => {
    it("(BasicGI1) Returns ImplementationMetadata object", async () => {
      try {
        const info = fdc3.getInfo();
        expect(info, getInfoDocs).to.have.property("fdc3Version");
        expect(info, getInfoDocs).to.have.property("provider");
      } catch (ex) {
        assert.fail(getInfoDocs + (ex.message ?? ex));
      }
    });
  });
