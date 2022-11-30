import APIDocumentation from "../../../apiDocuments";
import { OpenControl1_2 } from "./open-support-1.2";
import { createOpenTests} from "../../common/fdc3.open"

const openDocs = "\r\nDocumentation: " + APIDocumentation.open + "\r\nCause: ";
export default () => createOpenTests(new OpenControl1_2(), openDocs, "1.2");
