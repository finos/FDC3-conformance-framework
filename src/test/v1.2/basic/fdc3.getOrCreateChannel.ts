import { assert, expect } from "chai";
import { DesktopAgent } from "fdc3_1_2/dist/api/DesktopAgent";
import { APIDocumentation1_2 } from "../apiDocuments-1.2";

declare let fdc3: DesktopAgent;
const getOrCreateChannelDocs =
  "\r\nDocumentation: " + APIDocumentation1_2.getOrCreateChannel + "\r\nCause";

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
