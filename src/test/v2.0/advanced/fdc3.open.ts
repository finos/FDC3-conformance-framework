import { assert } from "chai";
import APIDocumentation from "../../../apiDocuments";
import constants from "../../../constants";
import { OpenControl2_0 } from "./open-support-1.2";

const openDocs = "\r\nDocumentation: " + APIDocumentation.open + "\r\nCause:";

const appBId = "MockAppId";
const intentAppC = "IntentAppCId";

const control = new OpenControl2_0();

export default () =>
  describe("fdc3.open", () => {
    const AOpensB1 =
      "(2.0-AOpensB1) Can open app B from app A with AppIdentifier (appId) as target";
    it(AOpensB1, async () => {
      const result = control.contextReceiver("fdc3-conformance-opened");
      await control.openIntentApp(appBId);
      await result;
      await control.closeAppWindows(AOpensB1);
    });

    it("(2.0-AFailsToOpenB) Receive AppNotFound error when targeting non-existent AppIdentifier (appId) as target", async () => {
      try {
        await control.openIntentApp("ThisAppDoesNotExist");
        assert.fail("No error was thrown", openDocs);
      } catch (ex) {
        control.confirmAppNotFoundErrorReceived(ex);
      }
    });

    const AOpensBWithContext =
      "(2.0-AOpensBWithContext) Can open app B from app A with context and AppIdentifier (appId) as target but app B listening for null context";
    it(AOpensBWithContext, async () => {
      const receiver = control.contextReceiver("context-received");
      await control.openIntentApp(intentAppC, "fdc3.instrument");
      await control.validateReceivedContextType(receiver);
      await control.closeAppWindows(AOpensBWithContext);
    });

    const AOpensBWithSpecificContext =
      "(2.0-AOpensBWithSpecificContext) Can open app B from app A with context and AppIdentifier (appId) as target and app B is expecting context";
    it(AOpensBWithSpecificContext, async () => {
      const receiver = control.contextReceiver("context-received");
      await control.openIntentApp(appBId, "fdc3.instrument");
      await control.validateReceivedContextType(receiver);
      await control.closeAppWindows(AOpensBWithSpecificContext);
    });

    const AOpensBMultipleListen =
      "(2.0-AOpensBMultipleListen) Can open app B from app A with context and AppIdentifier (appId) as target but app B add listener before correct one";
    it(AOpensBMultipleListen, async () => {
      const receiver = control.contextReceiver("context-received");
      await control.openIntentApp(appBId, "fdc3.instrument");
      await control.validateReceivedContextType(receiver);
      await control.closeAppWindows(AOpensBMultipleListen);
    });

    const AOpensBWithWrongContext =
      "(2.0-AOpensBWithWrongContext) Received App time out when opening app B with fake context, app b listening for different context";
    it(AOpensBWithWrongContext, async () => {
      await control.addListenerAndFailIfReceived();
      await control.expectAppTimeoutErrorOnOpen("OpenAppAId");
    }).timeout(constants.NoListenerTimeout + 1000);

    const AOpensBNoListen =
      "(2.0-AOpensBNoListen) Received App time out when opening app B with fake context, app b not listening for any context";
    it(AOpensBNoListen, async () => {
      await control.expectAppTimeoutErrorOnOpen("OpenAppBId");
    }).timeout(constants.NoListenerTimeout + 1000);
  });
