import { assert, expect } from "chai";
import { DesktopAgent } from "fdc3_1_2/dist/api/DesktopAgent";

declare let fdc3: DesktopAgent;

export default () =>
  describe("fdc3.joinChannel", () => {
    afterEach(async () => {
      await fdc3.leaveCurrentChannel();
    });

    it("Can join channel", async () => {
      const channels = await fdc3.getSystemChannels();

      if (channels.length > 0) {
        try {
          await fdc3.joinChannel(channels[0].id);
          const currentChannel = await fdc3.getCurrentChannel();
          expect(currentChannel).to.not.be.null;
        } catch (ex) {
          assert.fail("Error while joining channel: " + (ex.message ?? ex));
        }
      } else {
        assert.fail("No system channels available");
      }
    });
  });
