import { APIDocumentation1_2 } from "../apiDocuments-1.2";
import { ChannelControl1_2 } from "./channels-support-1.2";
import { createAppChannelTests } from "../../common/fdc3.app-channels";
import { createUserChannelTests } from "../../common/fdc3.user-channels";

const documentation =
  "\r\nDocumentation: " + APIDocumentation1_2.desktopAgent + "\r\nCause:";

export default () => describe("channels", () => {
  createUserChannelTests(new ChannelControl1_2(), documentation, "");
  createAppChannelTests(new ChannelControl1_2(), documentation, "");
});