import { APIDocumentation1_2 } from "../apiDocuments-1.2";
import { ChannelControl1_2 } from "../support/channels-support-1.2";
import { createAppChannelTests } from "../../common/fdc3.app-channels";
import { createUserChannelTests } from "../../common/fdc3.user-channels";

const documentation = "\r\nDocumentation: " + APIDocumentation1_2.desktopAgent + "\r\nCause:";
const control = new ChannelControl1_2();

export default () =>
  describe("Channels_1.2", () => {
    const UCFilteredUsageJoin = "(" + '1.2-' + "UCFilteredUsageJoin) getCurrentChannel retrieves the channel that was joined";
    beforeEach(control.leaveChannel);

    afterEach(async function afterEach() {
      if (this.currentTest.title !== UCFilteredUsageJoin) await control.closeMockApp(this.currentTest.title);
    });
    createUserChannelTests(control, documentation, "1.2-");
    createAppChannelTests(control, documentation, "1.2-");
  });
