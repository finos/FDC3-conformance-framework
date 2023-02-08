import { assert, expect } from "chai";
import { DesktopAgent } from "fdc3_2_0/dist/api/DesktopAgent";
import { APIDocumentation2_0 } from "../apiDocuments-2.0";

declare let fdc3: DesktopAgent;
const getCurrentChannelDocs = "\r\nDocumentation: " + APIDocumentation2_0.getCurrentChannel + "\r\nCause";

export default () => 
     describe("fdc3.getCurrentChannel", () => {
      it("(BasicJC1) getCurrentChannel should retrieve 'null' or a channel object depending upon whether the channel has been joined or not", async () => {
        const channels = await fdc3.getUserChannels();
        if (channels.length > 0) {
          try {
            await fdc3.joinUserChannel(channels[0].id);
            const currentChannel = await fdc3.getCurrentChannel();
            if(typeof currentChannel !== "object") {
              assert.fail("getCurrentChannel did not retrieve a channel object" + getCurrentChannelDocs);
            }
            expect(currentChannel.id).to.eql(channels[0].id);
  
            await fdc3.leaveCurrentChannel();
            const currentChannelAfterLeave = await fdc3.getCurrentChannel();
            expect(currentChannelAfterLeave).to.be.null;
  
          } catch (ex) {
            assert.fail("Error: " + (ex.message ?? ex));
          }
        } else {
          assert.fail("No user channels available");
        }
      });
});
