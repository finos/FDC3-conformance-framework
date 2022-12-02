import { assert } from "chai";
import { APIDocumentation1_2 } from "../apiDocuments-1.2";
import { DesktopAgent } from "fdc3_1_2/dist/api/DesktopAgent";
import { OpenControl1_2 } from "./open-support-1.2";
import { openApp } from "../../common/open-control";

declare let fdc3: DesktopAgent;
const openDocs = "\r\nDocumentation: " + APIDocumentation1_2.open + "\r\nCause: ";
const control = new OpenControl1_2();

/**
 * Details on the mock apps used in these tests can be found in /mock/README.md
 */
export default () =>
  describe("fdc3.open", () => {
    beforeEach(async () => {
      await fdc3.leaveCurrentChannel();
    });

    const AOpensB1Test =
      "(AOpensB1) Can open app B from app A with no context and string as target";
    it(AOpensB1Test, async () => {
      const result = control.contextReceiver("fdc3-conformance-opened");
      await control.openMockApp(openApp.b.name);
      await result;
      await control.closeAppWindows(AOpensB1Test);
    });

    const AOpensB2Test =
      "(AOpensB2) Can open app B from app A with no context and AppMetadata (name) as target";
    it(AOpensB2Test, async () => {
      const result = control.contextReceiver("fdc3-conformance-opened");
      await control.openMockApp(openApp.b.name);
      await result;
      await control.closeAppWindows(AOpensB2Test)
    });

    const AOpensB3Test =
      "(AOpensB3) Can open app B from app A with no context and AppMetadata (name and appId) as target";
    it(AOpensB3Test, async () => {
      const result = control.contextReceiver("fdc3-conformance-opened");
      await control.openMockApp(openApp.b.name, openApp.b.id);
      await result;
      await control.closeAppWindows(AOpensB3Test);
    });

    const AFailsToOpenB1Test =
      "(AFailsToOpenB1) Receive AppNotFound error when targeting non-existent app name as target";
    it(AFailsToOpenB1Test, async () => {
      try {
        await control.openMockApp("ThisAppDoesNotExist");
        assert.fail("No error was not thrown", openDocs);
      } catch (ex) {
        control.confirmAppNotFoundErrorReceived(ex);
      }
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
        await control.openMockApp("ThisAppDoesNotExist", "ThisAppDoesNotExist");
        assert.fail("No error was not thrown", openDocs);
      } catch (ex) {
        control.confirmAppNotFoundErrorReceived(ex);
      }
    });

    const AOpensBWithSpecificContext1Test =
      "(AOpensBWithSpecificContext1) Can open app B from app A with context and string as target, app B adds specific listener";
    it(AOpensBWithSpecificContext1Test, async () => {
      const receiver = control.contextReceiver("fdc3-conformance-context-received");
      await control.openMockApp(openApp.b.name, undefined, "fdc3.testReceiver");
      await control.validateReceivedContext(receiver, "fdc3.testReceiver");
      await control.closeAppWindows(AOpensBWithSpecificContext1Test);
    });

    const AOpensBWithSpecificContext2Test =
      "(AOpensBWithSpecificContext2) Can open app B from app A with context and AppMetadata (name) as target, app B adds specific listener";
    it(AOpensBWithSpecificContext2Test, async () => {
      const receiver = control.contextReceiver("fdc3-conformance-context-received");
      await control.openMockApp(openApp.b.name, undefined, "fdc3.testReceiver");
      await control.validateReceivedContext(receiver, "fdc3.testReceiver");
      await control.closeAppWindows(AOpensBWithSpecificContext2Test);
    });

    const AOpensBWithSpecificContextTest =
      "(AOpensBWithSpecificContext) Can open app B from app A with context and AppMetadata (name and appId) as target, app B adds specific listener";
    it(AOpensBWithSpecificContextTest, async () => {
      const receiver = control.contextReceiver("fdc3-conformance-context-received");
      await control.openMockApp(openApp.b.name, openApp.b.id, "fdc3.testReceiver");
      await control.validateReceivedContext(receiver, "fdc3.testReceiver");
      await control.closeAppWindows(AOpensBWithSpecificContextTest);
    });

    const AOpensBWithContext1Test =
      "(AOpensBWithContext1) Can open app B from app A with context and string as target, app B adds generic listener";
    it(AOpensBWithContext1Test, async () => {
      const receiver = control.contextReceiver("fdc3-conformance-context-received");
      await control.openMockApp(openApp.c.name, undefined, "fdc3.genericListener");
      await control.validateReceivedContext(receiver, "fdc3.genericListener");
      await control.closeAppWindows(AOpensBWithContext1Test);
    });

    const AOpensBWithContext2Test =
      "(AOpensBWithContext2) Can open app B from app A with context and AppMetadata (name) as target, app B adds generic listener";
    it(AOpensBWithContext2Test, async () => {
      const receiver = control.contextReceiver("fdc3-conformance-context-received");
      await control.openMockApp(openApp.c.name, undefined, "fdc3.genericListener");
      await control.validateReceivedContext(receiver, "fdc3.genericListener");
      await control.closeAppWindows(AOpensBWithContext2Test);
    });

    const AOpensBWithContext3Test =
      "(AOpensBWithContext3) Can open app B from app A with context and AppMetadata (name and appId) as target, app B adds generic listener";
    it(AOpensBWithContext3Test, async () => {
      const receiver = control.contextReceiver("fdc3-conformance-context-received");
      await control.openMockApp(openApp.c.name, openApp.c.id,"fdc3.genericListener");
      await control.validateReceivedContext(receiver, "fdc3.genericListener");
      await control.closeAppWindows(AOpensBWithContext3Test);
    });

    const AOpensBMultipleListenTest =
      "(AOpensBMultipleListen) Can open app B from app A with context and AppMetadata (name and appId) as target, app B has opened multiple listeners";
    it(AOpensBMultipleListenTest, async () => {
      const receiver = control.contextReceiver("fdc3-conformance-context-received-multiple");
      await control.openMockApp(openApp.b.name, openApp.b.id, "fdc3.testReceiverMultiple");
      await control.validateReceivedContext(receiver, "fdc3.testReceiverMultiple");
      await control.closeAppWindows(AOpensBMultipleListenTest);
    });

    //Correct behaviour needs to be clarified before we can implement this test
    // const AOpensBMalformedContext = `(AOpensBMalformedContext) App B listeners receive nothing when passing a malformed context`;
    // it(AOpensBMalformedContext, async () => {
    //   const receiver = control.contextReceiver("context-received", true);
    //   await control.openMockApp(
    //     openApp.f.name,
    //     undefined,
    //     undefined,
    //     true,
    //     true
    //   );
    //   console.log("before receiver")
    //   await receiver;
    //   console.log("after receiver")
    //   await control.closeAppWindows(AOpensBMalformedContext);
    // });
  });
