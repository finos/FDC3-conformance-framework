import { assert, expect } from "chai";
import { DesktopAgent } from "../../../../node_modules/fdc3_1_2/dist/api/DesktopAgent";

export default () =>
  describe("fdc3.joinChannel", () => {
    afterEach(async () => {
      await (<DesktopAgent>window.fdc3).leaveCurrentChannel();
    });

    it("Can join channel", async () => {
      const channels = await (<DesktopAgent>window.fdc3).getSystemChannels();

      if (channels.length > 0) {
        try {
          await (<DesktopAgent>window.fdc3).joinChannel(channels[0].id);
          const currentChannel = await (<DesktopAgent>(
            window.fdc3
          )).getCurrentChannel();
          expect(currentChannel).to.not.be.null;
        } catch (ex) {
          assert.fail("Error while joining channel: " + (ex.message ?? ex));
        }
      } else {
        assert.fail("No system channels available");
      }
    });
  });
