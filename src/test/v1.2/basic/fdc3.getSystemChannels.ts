import { assert, expect } from "chai";
import { DesktopAgent } from "fdc3_1_2/dist/api/DesktopAgent";
import { APIDocumentation1_2 } from "../apiDocuments-1.2";

declare let fdc3: DesktopAgent;
const getSystemChannelDocs =
  "\r\nDocumentation: " + APIDocumentation1_2.getSystemChannels + "\r\nCause";

export default () =>
  describe("fdc3.getSystemChannels", () => {
    it("(BasicUC1) Channel object is valid", async () => {
      const channels = await fdc3.getSystemChannels();
      expect(channels.length, getSystemChannelDocs).to.be.greaterThan(0);
      expect(typeof channels).to.be.equals("object", getSystemChannelDocs);
      expect(channels[0]).to.have.property("type");
      expect(channels[0]).to.have.property("id");
    });
  });
