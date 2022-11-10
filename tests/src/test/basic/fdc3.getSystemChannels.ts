import { assert, expect } from "chai";
import APIDocumentation from "../../apiDocuments";

const getSystemChannelDocs =
  "\r\nDocumentation: " + APIDocumentation.getSystemChannels + "\r\nCause";

export default () =>
  describe("fdc3.getSystemChannels", () => {
    it("Method is callable", async () => {
      try {
        await window.fdc3.getSystemChannels();
      } catch (ex) {
        assert.fail(getSystemChannelDocs + (ex.message ?? ex));
      }
    });
  });
