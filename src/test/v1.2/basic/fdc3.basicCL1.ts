import { Listener } from "fdc3_1_2";
import { assert, expect } from "chai";
import { APIDocumentation1_2 } from "../apiDocuments-1.2";
import { DesktopAgent } from "fdc3_1_2/dist/api/DesktopAgent";
import { basicCL1 } from "../../common/basic/fdc3.basic";

declare let fdc3: DesktopAgent;
const documentation = "\r\nDocumentation: " + APIDocumentation1_2.addContextListener + "\r\nCause";
let listener: Listener;
export default () => 
describe("fdc3.basicCL1", () => basicCL1(fdc3, documentation, listener) );
  
