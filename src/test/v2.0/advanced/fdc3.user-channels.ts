import { createUserChannelTests } from "../../common/fdc3.user-channels";
import { APIDocumentation2_0 } from "../apiDocuments-2.0";
import { ChannelControl2_0 } from "./channels-support-2.0";

const documentation =
  "\r\nDocumentation: " + APIDocumentation2_0.desktopAgent + "\r\nCause:";

export default () => createUserChannelTests(new ChannelControl2_0(), documentation, "")