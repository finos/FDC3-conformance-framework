import { APIDocumentation1_2 } from "../apiDocuments-1.2";
import { ChannelControl1_2 } from "./channels-support-1.2";
import { createAppChannelTests } from "../../common/fdc3.app-channels";

const documentation =
  "\r\nDocumentation: " + APIDocumentation1_2.desktopAgent + "\r\nCause:";

export default () => createAppChannelTests(new ChannelControl1_2(), documentation, "")