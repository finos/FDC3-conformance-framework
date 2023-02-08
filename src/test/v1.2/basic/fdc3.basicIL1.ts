import { Listener } from "fdc3_1_2";
import { assert, expect } from "chai";
import { DesktopAgent } from "fdc3_1_2/dist/api/DesktopAgent";
import { APIDocumentation1_2 } from "../apiDocuments-1.2";
import { basicIL1 } from "../../common/basic/fdc3.basic";

declare let fdc3: DesktopAgent;
const documentation = "\r\nDocumentation: " + APIDocumentation1_2.addIntentListener + "\r\nCause";
let listener: Listener;
export default () =>
  describe("fdc3.basicIL1", () => basicIL1(fdc3, documentation, listener));
