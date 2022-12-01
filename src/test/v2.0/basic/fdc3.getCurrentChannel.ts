import { assert, expect } from "chai";
import { DesktopAgent } from "fdc3_2_0/dist/api/DesktopAgent";
import { APIDocumentation2_0 } from "../apiDocuments-2.0";

declare let fdc3: DesktopAgent;
const getCurrentChannelDocs =
  "\r\nDocumentation: " + APIDocumentation2_0.getCurrentChannel + "\r\nCause";

export default () =>
  describe("fdc3.getCurrentChannel", () => {
    it("(2.0-BasicCH1) Method is callable", async () => {
      try {
        const channel = await fdc3.getCurrentChannel();
      } catch (ex) {
        assert.fail(getCurrentChannelDocs + (ex.message ?? ex));
      }
    });

    it("(2.0-BasicCH2) getCurrentChannel() returns null if no channel has been joined", async () => {
      try {
        const channel = await fdc3.getCurrentChannel();
        expect(channel).equals(null);
      } catch (ex) {
        assert.fail(getCurrentChannelDocs + (ex.message ?? ex));
      }
    });
  });
