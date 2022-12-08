import constants from "../../../constants";
import { getCommonOpenTests } from "../../common/fdc3.open";
import { openApp, OpenCommonConfig } from "../../common/open-control";
import { APIDocumentation2_0 } from "../apiDocuments-2.0";
import { expectAppTimeoutErrorOnOpen, OpenControl2_0 } from "./open-support-2.0";

const openDocs = "\r\nDocumentation: " + APIDocumentation2_0 + "\r\nCause:";
const control = new OpenControl2_0();

const config: OpenCommonConfig = {
  fdc3Version: "2.0",
  prefix: "2.0-",
  target: "AppIdentifier",
  targetMultiple: "AppIdentifier",
};

export default () =>
  describe("fdc3.open", () => {
    //run common open tests
    getCommonOpenTests(control, openDocs, config);

    //run v2.0-only open tests
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
  });
