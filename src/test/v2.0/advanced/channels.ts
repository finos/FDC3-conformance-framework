import { APIDocumentation2_0 } from "../apiDocuments-2.0";
import { createAppChannelTests } from "../../common/fdc3.app-channels";
import { ChannelControl2_0 } from "./channels-support-2.0";
import { createUserChannelTests } from "../../common/fdc3.user-channels";

const documentation =
  "\r\nDocumentation: " + APIDocumentation2_0.desktopAgent + "\r\nCause:";

export default () => describe("channels", () => {
  createUserChannelTests(new ChannelControl2_0(), documentation, "2.0-");
  createAppChannelTests(new ChannelControl2_0(), documentation, "2.0-");
});