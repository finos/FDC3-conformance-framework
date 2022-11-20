import { assert, expect } from "chai";
import APIDocumentation from "../../../apiDocuments";
import { DesktopAgent } from "fdc3_1_2/dist/api/DesktopAgent";

declare let fdc3: DesktopAgent;
const getOrCreateChannelDocs =
  "\r\nDocumentation: " + APIDocumentation.getOrCreateChannel + "\r\nCause";

export default () =>
  describe("fdc3.getOrCreateChannel", () => {
    it("(BasicAC1) Returns Channel object", async () => {
      try {
        const channel = await fdc3.getOrCreateChannel("FDC3Conformance");
        expect(channel, getOrCreateChannelDocs).to.have.property("id");
        expect(channel, getOrCreateChannelDocs).to.have.property("type");
        expect(channel, getOrCreateChannelDocs).to.have.property("broadcast");
        expect(channel, getOrCreateChannelDocs).to.have.property(
          "getCurrentContext"
        );
        expect(channel, getOrCreateChannelDocs).to.have.property(
          "addContextListener"
        );
      } catch (ex) {
        assert.fail(getOrCreateChannelDocs + (ex.message ?? ex));
      }
    });
  });
