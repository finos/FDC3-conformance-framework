import { assert } from "chai";
import {APIDocumentation2_0} from "../apiDocuments-2.0";
import constants from "../../../constants";
import { openApp } from "../../common/open-control";
import { OpenControl2_0 } from "./open-support-2.0";

const openDocs = "\r\nDocumentation: " + APIDocumentation2_0.open + "\r\nCause:";
const control = new OpenControl2_0();

export default () =>
  describe("fdc3.open", () => {
    const AOpensB1 =
      "(2.0-AOpensB1) Can open app B from app A with AppIdentifier (appId) as target";
    it(AOpensB1, async () => {
      const result = control.contextReceiver("fdc3-conformance-opened");
      await control.openMockApp(openApp.b.id);
      await result;
      await control.closeAppWindows(AOpensB1);
    });

    it("(2.0-AFailsToOpenB) Receive AppNotFound error when targeting non-existent AppIdentifier (appId) as target", async () => {
      try {
        await control.openMockApp("ThisAppDoesNotExist");
        assert.fail("No error was thrown", openDocs);
      } catch (ex) {
        control.confirmAppNotFoundErrorReceived(ex);
      }
    });

    const AOpensBWithContext =
      "(2.0-AOpensBWithContext) Can open app B from app A with context and AppIdentifier (appId) as target but app B listening for null context";
    it(AOpensBWithContext, async () => {
      const receiver = control.contextReceiver("context-received");
      await control.openMockApp(openApp.c.id, "fdc3.instrument");
      await control.validateReceivedContext(receiver, "fdc3.instrument");
      await control.closeAppWindows(AOpensBWithContext);
    });

    const AOpensBWithSpecificContext =
      "(2.0-AOpensBWithSpecificContext) Can open app B from app A with context and AppIdentifier (appId) as target and app B is expecting context";
    it(AOpensBWithSpecificContext, async () => {
      const receiver = control.contextReceiver("context-received");
      await control.openMockApp(openApp.b.id, "fdc3.instrument");
      await control.validateReceivedContext(receiver, "fdc3.instrument");
      await control.closeAppWindows(AOpensBWithSpecificContext);
    });

    const AOpensBMultipleListen =
      "(2.0-AOpensBMultipleListen) Can open app B from app A with context and AppIdentifier (appId) as target but app B add listener before correct one";
    it(AOpensBMultipleListen, async () => {
      const receiver = control.contextReceiver("context-received");
      await control.openMockApp(openApp.b.id, "fdc3.instrument");
      await control.validateReceivedContext(receiver, "fdc3.instrument");
      await control.closeAppWindows(AOpensBMultipleListen);
    });

    const AOpensBWithWrongContext =
      "(2.0-AOpensBWithWrongContext) Received App timeout when opening app B with fake context, app b listening for different context";
    it.only(AOpensBWithWrongContext, async () => {
      await control.addListenerAndFailIfReceived();
      await control.expectAppTimeoutErrorOnOpen(openApp.d.id);
      await control.closeAppWindows(AOpensBWithWrongContext);
    }).timeout(constants.NoListenerTimeout + 1000);

    const AOpensBNoListen =
      "(2.0-AOpensBNoListen) Received App timeout when opening app B with fake context, app b not listening for any context";
    it(AOpensBNoListen, async () => {
      await control.expectAppTimeoutErrorOnOpen(openApp.e.id);
      await control.closeAppWindows(AOpensBNoListen);
    }).timeout(constants.NoListenerTimeout + 1000);
  });
