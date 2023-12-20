import { APIDocumentation2_0 } from "../apiDocuments-2.0";
import { createAppChannelTests } from "../../common/fdc3.app-channels";
import { ChannelControl2_0 } from "../support/channels-support-2.0";
import { createUserChannelTests } from "../../common/fdc3.user-channels";

const documentation = "\r\nDocumentation: " + APIDocumentation2_0.desktopAgent + "\r\nCause:";
const control = new ChannelControl2_0();

export default () =>
  describe("Channels_2.0", () => {
    const UCFilteredUsageJoin = "(" + '2.0-' + "UCFilteredUsageJoin) getCurrentChannel retrieves the channel that was joined";
    beforeEach(control.leaveChannel);

    afterEach(async function afterEach() {
      if (this.currentTest.title !== UCFilteredUsageJoin) await control.closeMockApp(this.currentTest.title);
    });
    createUserChannelTests(control, documentation, "2.0-");
    createAppChannelTests(control, documentation, "2.0-");
  });
