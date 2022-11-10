import { assert } from "chai";
import APIDocumentation from "../../apiDocuments";
import { DesktopAgent } from "fdc3_2_0/dist/api/DesktopAgent";

const getSystemChannelDocs =
  "\r\nDocumentation: " + APIDocumentation.getSystemChannels + "\r\nCause";

export default () =>
  describe("fdc3.getUserChannels", () => {
    it("Method is callable", async () => {
      try {
        await (<DesktopAgent>(<unknown>window.fdc3)).getUserChannels();
      } catch (ex) {
        assert.fail(getSystemChannelDocs + (ex.message ?? ex));
      }
    });
  });
