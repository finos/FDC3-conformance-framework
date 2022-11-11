import { assert, expect } from "chai";
import APIDocumentation from "../../../apiDocuments";
import { DesktopAgent } from "fdc3_1_2/dist/api/DesktopAgent";

const getCurrentChannelDocs =
  "\r\nDocumentation: " + APIDocumentation.getCurrentChannel + "\r\nCause";

export default () =>
  describe("fdc3.getCurrentChannel", () => {
    it("(BasicCH1) Method is callable", async () => {
      try {
        const channel = await window.fdc3.getCurrentChannel();
      } catch (ex) {
        assert.fail(getCurrentChannelDocs + (ex.message ?? ex));
      }
    });

    it("(BasicCH2) getCurrentChannel() returns null if no channel has been joined", async () => {
      try {
        await window.fdc3.leaveCurrentChannel()
        const channel = await (<DesktopAgent>(
          (<unknown>window.fdc3)
        )).getCurrentChannel();
        expect(channel).equals(null)
      } catch (ex) {
        console.log(ex)
        assert.fail(getCurrentChannelDocs + (ex.message ?? ex));
      }
    });
  });
