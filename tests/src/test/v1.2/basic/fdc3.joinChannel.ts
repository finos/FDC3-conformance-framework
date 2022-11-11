import { assert, expect } from "chai";
import { DesktopAgent } from "fdc3_1_2/dist/api/DesktopAgent";

export default () =>
  describe("fdc3.joinChannel", () => {
    afterEach(async () => {
      await window.fdc3.leaveCurrentChannel();
    });

    it("(BasicJC1) Can join channel", async () => {
      const channels = await window.fdc3.getSystemChannels();

      if (channels.length > 0) {
        try {
          const joiningId = channels[0].id
          await window.fdc3.joinChannel(joiningId);
          const currentChannel = await window.fdc3.getCurrentChannel();
          expect(currentChannel).to.not.be.null;
          expect(currentChannel.id).to.equal(joiningId)
        } catch (ex) {
          assert.fail("Error while joining channel: " + (ex.message ?? ex));
        }
      } else {
        assert.fail("No system channels available");
      }
    });
  });
