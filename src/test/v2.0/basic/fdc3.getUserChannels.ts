import { assert, expect } from "chai";
import { DesktopAgent } from "fdc3_2_0/dist/api/DesktopAgent";
import { APIDocumentation2_0 } from "../apiDocuments-2.0";

declare let fdc3: DesktopAgent;
const getUserChannelDocs =
  "\r\nDocumentation: " + APIDocumentation2_0.getUserChannels + "\r\nCause";

export default () =>
  describe("fdc3.getUserChannels", () => {
    it("(2.0-BasicUC1) Method is callable", async () => {
      try {
        let channels = await fdc3.getUserChannels();
        expect(channels.length, getUserChannelDocs).to.be.greaterThan(0);
        expect(typeof channels).to.be.equals('object', getUserChannelDocs);
        for(let i=0; i<channels.length; i++) {
          expect(channels[i]).to.have.property('id');
          expect(channels[i]).to.have.property('type');
        }
      } catch (ex) {
        assert.fail(getUserChannelDocs + (ex.message ?? ex));
      }
    });
  });
