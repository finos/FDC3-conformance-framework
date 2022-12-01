import { assert, expect } from "chai";
import { DesktopAgent } from "fdc3_1_2/dist/api/DesktopAgent";
import { APIDocumentation1_2 } from "../apiDocuments-1.2";

declare let fdc3: DesktopAgent;
const getCurrentChannelDocs =
  "\r\nDocumentation: " + APIDocumentation1_2.getCurrentChannel + "\r\nCause";

export default () =>
  describe("fdc3.getCurrentChannel", () => {
    it("(BasicCH1) Method is callable", async () => {
      try {
        const channel = await fdc3.getCurrentChannel();
      } catch (ex) {
        assert.fail(getCurrentChannelDocs + (ex.message ?? ex));
      }
    });

    it("(BasicCH2) getCurrentChannel() returns null if no channel has been joined", async () => {
      try {
        const channel = await fdc3.getCurrentChannel();
        expect(channel).equals(null);
      } catch (ex) {
        assert.fail(getCurrentChannelDocs + (ex.message ?? ex));
      }
    });
  });
