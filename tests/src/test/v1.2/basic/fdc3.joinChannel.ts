import { assert, expect } from "chai";

export default () =>
  describe("fdc3.joinChannel", () => {
    afterEach(async () => {
      await window.fdc3.leaveCurrentChannel();
    });

    it("Can join channel", async () => {
      const channels = await window.fdc3.getSystemChannels();

      if (channels.length > 0) {
        try {
          await window.fdc3.joinChannel(channels[0].id);
          const currentChannel = await window.fdc3.getCurrentChannel();
          expect(currentChannel).to.not.be.null;
        } catch (ex) {
          assert.fail("Error while joining channel: " + (ex.message ?? ex));
        }
      } else {
        assert.fail("No system channels available");
      }
    });
  });
