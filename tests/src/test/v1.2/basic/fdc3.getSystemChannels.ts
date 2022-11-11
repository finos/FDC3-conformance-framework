import { assert, expect } from "chai";
import APIDocumentation from "../../../apiDocuments";

const getSystemChannelDocs =
  "\r\nDocumentation: " + APIDocumentation.getSystemChannels + "\r\nCause";

export default () =>
  describe("fdc3.getSystemChannels", () => {
    it("(BasicUC1) Method is callable, returns channels", async () => {
      try {
        const result = await window.fdc3.getSystemChannels();
        expect(result.length).greaterThan(0)
        result.forEach(c => {
          expect(c.type).equals("system")
          expect(c.id).not.equals(null);
        })
      } catch (ex) {
        assert.fail(getSystemChannelDocs + (ex.message ?? ex));
      }
    });
  });
