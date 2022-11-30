import APIDocumentation from "../../../apiDocuments";
import constants from "../../../constants";
import { createOpenTests } from "../../common/fdc3.open";
import { openApp } from "../../common/open-control";
import { expectAppTimeoutErrorOnOpen, OpenControl2_0 } from "./open-support-2.0";

const openDocs = "\r\nDocumentation: " + APIDocumentation.open2_0 + "\r\nCause:";
const control = new OpenControl2_0();
export default () => createOpenTests(control, openDocs, "2.0");

export function runOpenTestsV2_0() {
    const AOpensBWithWrongContext =
      "(2.0-AOpensBWithWrongContext) Received App timeout when opening app B with fake context, app b listening for different context";
    it(AOpensBWithWrongContext, async () => {
      await control.addListenerAndFailIfReceived();
      await expectAppTimeoutErrorOnOpen(openApp.d.id);
      await control.closeAppWindows(AOpensBWithWrongContext);
    }).timeout(constants.NoListenerTimeout + 1000);

    const AOpensBNoListen =
      "(2.0-AOpensBNoListen) Received App timeout when opening app B with fake context, app b not listening for any context";
    it(AOpensBNoListen, async () => {
      await expectAppTimeoutErrorOnOpen(openApp.e.id);
      await control.closeAppWindows(AOpensBNoListen);
    }).timeout(constants.NoListenerTimeout + 1000);
  }