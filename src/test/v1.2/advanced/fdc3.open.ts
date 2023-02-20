import { OpenControl1_2 } from "../support/open-support-1.2";
import { getCommonOpenTests } from "../../common/fdc3.open";
import { openApp, OpenCommonConfig } from "../../common/control/open-control";
import { assert } from "chai";
import { APIDocumentation1_2 } from "../apiDocuments-1.2";
import { TargetApp } from "fdc3_1_2";

const openDocs = "\r\nDocumentation: " + APIDocumentation1_2.open + "\r\nCause: ";
const control = new OpenControl1_2();

const config: OpenCommonConfig = {
  fdc3Version: "1.2",
  prefix: "",
  target: "app name",
  targetMultiple: "both app name and appId",
};

export default () =>
  describe("fdc3.open", () => {
    //run common open tests
    getCommonOpenTests(control, openDocs, config);

    //run 1.2-only tests

    const AOpensB1 = `(AOpensB1) Can open app B from app A with no context and ensure that the correct app was opened`;
    it(AOpensB1, async () => {
      const result = control.contextReceiver("fdc3-conformance-opened");
      await control.openMockAppNew(openApp.b.name);
      await result;
      await control.closeMockApp(AOpensB1);
    });

    const AOpensB2Test = "(AOpensB2) Can open app B from app A with no context and AppMetadata (name) as target";
    it(AOpensB2Test, async () => {
      let targetApp: TargetApp;
      targetApp = { name: openApp.b.name};
      const result = control.contextReceiver("fdc3-conformance-opened");
      await control.openMockAppNew(targetApp);
      await result;
      await control.closeMockApp(AOpensB2Test);
    });

    const AOpensB3Test = "(AOpensB3) Can open app B from app A with no context and AppMetadata (name and appId) as target";
    it(AOpensB3Test, async () => {
      let targetApp: TargetApp;
      targetApp = { name: openApp.b.name, appId:openApp.b.id};
      const result = control.contextReceiver("fdc3-conformance-opened");
      await control.openMockAppNew(targetApp);
      await result;
      await control.closeMockApp(AOpensB3Test);
    });

    const AFailsToOpenB2Test = "(AFailsToOpenB2) Receive AppNotFound error when targeting non-existent app AppMetadata (name) as target";
    it(AFailsToOpenB2Test, async () => {
      try {
        await control.openMockApp("ThisAppDoesNotExist");
        assert.fail("No error was not thrown", openDocs);
      } catch (ex) {
        control.confirmAppNotFoundErrorReceived(ex);
      }
    });

    const AFailsToOpenB3 = "(AFailsToOpenB3) Receive AppNotFound error when targeting non-existent app AppMetadata (name and appId) as target";
    it(AFailsToOpenB3, async () => {
      try {
        await control.openMockApp("ThisAppDoesNotExist", "ThisIdDoesNotExist");
        assert.fail("No error was not thrown", openDocs);
      } catch (ex) {
        control.confirmAppNotFoundErrorReceived(ex);
      }
    });

    const AOpensBWithContext2Test = "(AOpensBWithContext2) Can open app B from app A with context and AppMetadata (name) as target, app B adds generic listener";
    it(AOpensBWithContext2Test, async () => {
      const receiver = control.contextReceiver("context-received");
      await control.openMockApp(openApp.c.name, undefined, "fdc3.instrument");
      await control.validateReceivedContext(await receiver, "fdc3.instrument");
      await control.closeMockApp(AOpensBWithContext2Test);
    });

    const AOpensBWithContext3Test = "(AOpensBWithContext3) Can open app B from app A with context and AppMetadata (name and appId) as target, app B adds generic listener";
    it(AOpensBWithContext3Test, async () => {
      const receiver = control.contextReceiver("context-received");
      await control.openMockApp(openApp.c.name, openApp.c.id, "fdc3.instrument");
      await control.validateReceivedContext(await receiver, "fdc3.instrument");
      await control.closeMockApp(AOpensBWithContext3Test);
    });

    const AOpensBMalformedContext = `(AOpensBMalformedContext) App B listeners receive nothing when passing a malformed context`;
    it(AOpensBMalformedContext, async () => {
      const receiver = control.contextReceiver("context-received", true);
      await control.openMockApp(openApp.f.name, undefined, undefined, true, true);
      await receiver;
      await control.closeMockApp(AOpensBMalformedContext);
    });
  });
