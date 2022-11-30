import APIDocumentation from "../../../apiDocuments";
import { createOpenTests } from "../../common/fdc3.open";
import { OpenControl2_0 } from "./open-support-2.0";

const openDocs = "\r\nDocumentation: " + APIDocumentation.open2_0 + "\r\nCause:";
export default () => createOpenTests(new OpenControl2_0(), openDocs, "2.0");
