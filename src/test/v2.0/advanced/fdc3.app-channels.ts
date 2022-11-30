import { APIDocumentation2_0 } from "../../v2.0/apiDocuments-2.0";
import { createAppChannelTests } from "../../common/fdc3.app-channels";
import { ChannelControl2_0 } from "./channels-support-2.0";

const documentation =
  "\r\nDocumentation: " + APIDocumentation2_0.desktopAgent + "\r\nCause:";

export default () => createAppChannelTests(new ChannelControl2_0(), documentation, "")