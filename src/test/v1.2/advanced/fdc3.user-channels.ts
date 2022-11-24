import APIDocumentation from "../../../apiDocuments";
import { createUserChannelTests } from "../../common/fdc3.user-channels";
import { ChannelControl1_2 } from "./channels-support";

const documentation =
  "\r\nDocumentation: " + APIDocumentation.desktopAgent + "\r\nCause:";

export default () => createUserChannelTests(new ChannelControl1_2(), documentation, "")