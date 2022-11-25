import { assert } from "chai";
import { DesktopAgent } from "fdc3_2_0/dist/api/DesktopAgent";
import { APIDocumentation2_0 } from "../apiDocuments-2.0";

declare let fdc3: DesktopAgent;
const getSystemChannelDocs =
  "\r\nDocumentation: " + APIDocumentation2_0.getSystemChannels + "\r\nCause";

export default () =>
  describe("fdc3.getUserChannels", () => {
    it("(2.0-BasicUC1) Method is callable", async () => {
      try {
        await fdc3.getUserChannels();
      } catch (ex) {
        assert.fail(getSystemChannelDocs + (ex.message ?? ex));
      }
    });
  });
