import { createUserChannelTests } from "../../common/fdc3.user-channels";
import { APIDocumentation1_2 } from "../apiDocuments-1.2";
import { ChannelControl1_2 } from "./channels-support-1.2";

const documentation =
  "\r\nDocumentation: " + APIDocumentation1_2.desktopAgent + "\r\nCause:";

export default () => createUserChannelTests(new ChannelControl1_2(), documentation, "")