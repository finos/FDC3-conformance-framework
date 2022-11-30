import APIDocumentation from "../../../apiDocuments";
import { OpenControl1_2 } from "./open-support-1.2";
import { createOpenTests} from "../../common/fdc3.open"
import { openApp } from "../../common/open-control";
import { assert } from "chai";

const openDocs = "\r\nDocumentation: " + APIDocumentation.open + "\r\nCause: ";
const control = new OpenControl1_2();

//run common open tests
export default () => createOpenTests(control, openDocs, "1.2");

//run v1.2-only tests
export function runOpenTestsV1_2() {
    const AOpensB2Test =
      "(AOpensB2) Can open app B from app A with no context and AppMetadata (name) as target";
    it(AOpensB2Test, async () => {
      const result = control.contextReceiver("fdc3-conformance-opened");
      await control.openMockApp(openApp.b.name);
      await result;
      await control.closeAppWindows(AOpensB2Test);
    });

    const AOpensB3Test =
      "(AOpensB3) Can open app B from app A with no context and AppMetadata (name and appId) as target";
    it(AOpensB3Test, async () => {
      const result = control.contextReceiver("fdc3-conformance-opened");
      await control.openMockApp(openApp.b.name, openApp.b.id);
      await result;
      await control.closeAppWindows(AOpensB3Test);
    });

    const AFailsToOpenB2Test =
      "(AFailsToOpenB2) Receive AppNotFound error when targeting non-existent app AppMetadata (name) as target";
    it(AFailsToOpenB2Test, async () => {
      try {
        await control.openMockApp("ThisAppDoesNotExist");
        assert.fail("No error was not thrown", openDocs);
      } catch (ex) {
        control.confirmAppNotFoundErrorReceived(ex);
      }
    });

    const AFailsToOpenB3 =
      "(AFailsToOpenB3) Receive AppNotFound error when targeting non-existent app AppMetadata (name and appId) as target";
    it(AFailsToOpenB3, async () => {
      try {
        await control.openMockApp(
          "ThisAppDoesNotExist",
          "ThisIdDoesNotExist"
        );
        assert.fail("No error was not thrown", openDocs);
      } catch (ex) {
        control.confirmAppNotFoundErrorReceived(ex);
      }
    });

    const AOpensBWithContext2Test =
      "(AOpensBWithContext2) Can open app B from app A with context and AppMetadata (name) as target, app B adds generic listener";
    it(AOpensBWithContext2Test, async () => {
      const receiver = control.contextReceiver("context-received");
      await control.openMockApp(openApp.c.name, undefined, "fdc3.instrument");
      await control.validateReceivedContext(receiver, "fdc3.instrument");
      await control.closeAppWindows(AOpensBWithContext2Test);
    });

    const AOpensBWithContext3Test =
      "(AOpensBWithContext3) Can open app B from app A with context and AppMetadata (name and appId) as target, app B adds generic listener";
    it(AOpensBWithContext3Test, async () => {
      const receiver = control.contextReceiver("context-received");
      await control.openMockApp(openApp.c.name, openApp.c.id, "fdc3.instrument");
      await control.validateReceivedContext(receiver, "fdc3.instrument");
      await control.closeAppWindows(AOpensBWithContext3Test);
    });

    const AOpensBMalformedContext = `(AOpensBMalformedContext) App B listeners receive nothing when passing a malformed context`;
    it(AOpensBMalformedContext, async () => {
      const receiver = control.contextReceiver("context-received", true);
      await control.openMockApp(
        openApp.f.name,
        undefined,
        undefined,
        true,
        true
      );
      await receiver;
      await control.closeAppWindows(AOpensBMalformedContext);
    });
  }
