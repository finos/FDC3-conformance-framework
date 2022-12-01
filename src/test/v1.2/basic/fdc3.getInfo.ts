import { assert, expect } from "chai";
import { DesktopAgent } from "fdc3_1_2/dist/api/DesktopAgent";
import { APIDocumentation1_2 } from "../apiDocuments-1.2";

declare let fdc3: DesktopAgent;
const getInfoDocs =
  "\r\nDocumentation: " + APIDocumentation1_2.getInfo + "\r\nCause";

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
