import APIDocumentation from "../../../apiDocuments";
import { ChannelControl1_2 } from "./channels-support";
import { createAppChannelTests } from "../../common/fdc3.app-channels";

const documentation =
  "\r\nDocumentation: " + APIDocumentation.desktopAgent + "\r\nCause:";

export default () => createAppChannelTests(new ChannelControl1_2(), documentation, "")