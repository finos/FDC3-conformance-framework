import { assert, expect } from "chai";
import { DesktopAgent } from "fdc3_1_2/dist/api/DesktopAgent";

declare let fdc3: DesktopAgent;

export default () => {}
  // describe("fdc3.joinChannel", () => {
  //   it("(BasicJC1) getCurrentChannel should retrieve 'null' or a channel object depending upon whether the channel has been joined or not", async () => {
  //     const channels = await fdc3.getSystemChannels();
  //     if (channels.length > 0) {
  //       try {
  //         await fdc3.joinChannel(channels[0].id);
  //         const currentChannel = await fdc3.getCurrentChannel();
  //         if(typeof currentChannel !== "object") {
  //           assert.fail("getCurrentChannel did not retrieve a channel object");
  //         }
  //         expect(currentChannel.id).to.eql(channels[0].id);
  //         await fdc3.leaveCurrentChannel();
  //         const currentChannelAfterLeave = await fdc3.getCurrentChannel();
  //         expect(currentChannelAfterLeave).to.be.null;
  //       } catch (ex) {
  //         assert.fail("Error while joining channel: " + (ex.message ?? ex));
  //       }
  //     } else {
  //       assert.fail("No system channels available");
  //     }
  //   });
  // });
