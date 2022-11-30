import { assert } from "chai";
import { DesktopAgent } from "fdc3_1_2";
import constants from "../../constants";
import { expectAppTimeoutErrorOnOpen } from "../v2.0/advanced/open-support-2.0";
import { openApp, OpenControl } from "./open-control";
declare let fdc3: DesktopAgent;

export function createOpenTests(
  control: OpenControl<any>,
  documentation: string,
  fdc3Version: string
): Mocha.Suite {
  let prefix;
  let target;
  let target2;

  if (fdc3Version === "2.0") {
    prefix = "2.0-";
    target = "AppIdentifier";
    target2 = "AppIdentifier";
  } else {
    prefix = "";
    target = "app name";
    target2 = "both app name and appId";
  }

  return describe("fdc3.open", () => {
    const AOpensB1 = `(${prefix}AOpensB1) Can open app B from app A with ${target} as target`;
    it(AOpensB1, async () => {
      const result = control.contextReceiver("fdc3-conformance-opened");
      await control.openMockApp(openApp.b.name, undefined, undefined, true);
      await result;
      await control.closeAppWindows(AOpensB1);
    });

    it(`(${prefix}AFailsToOpenB) Receive AppNotFound error when targeting non-existent ${target} as target`, async () => {
      try {
        await control.openMockApp("ThisAppDoesNotExist", undefined, undefined, true);
        assert.fail("No error was thrown", documentation);
      } catch (ex) {
        control.confirmAppNotFoundErrorReceived(ex);
      }
    });

    const AOpensBWithContext = `(${prefix}AOpensBWithContext) Can open app B from app A with context and ${target} as target but app B listening for null context`;
    it(AOpensBWithContext, async () => {
      const receiver = control.contextReceiver("context-received");
      await control.openMockApp(openApp.c.name, undefined, "fdc3.instrument", true);
      await control.validateReceivedContext(receiver, "fdc3.instrument");
      await control.closeAppWindows(AOpensBWithContext);
    });

    const AOpensBWithSpecificContext = `(${prefix}AOpensBWithSpecificContext) Can open app B from app A with context and ${target2} as target and app B is expecting context`;
    it(AOpensBWithSpecificContext, async () => {
      const receiver = control.contextReceiver("context-received");
      await control.openMockApp(
        openApp.b.name,
        undefined,
        "fdc3.instrument"
      );

      await control.validateReceivedContext(receiver, "fdc3.instrument");
      await control.closeAppWindows(AOpensBWithSpecificContext);
    });

    const AOpensBMultipleListen = `(${prefix}AOpensBMultipleListen) Can open app B from app A with context and ${target2} as target but app B has multiple listeners added before the correct one`;
    it(AOpensBMultipleListen, async () => {
      const receiver = control.contextReceiver("context-received");
      await control.openMockApp(
        openApp.f.name,
        undefined,
        "fdc3.instrument",
        true
      );
      await control.validateReceivedContext(receiver, "fdc3.instrument");
      await control.closeAppWindows(AOpensBMultipleListen);
    });

    if (fdc3Version === "2.0") {
      runOpenTestsV2_0();
    } else if (fdc3Version === "1.2") {
      runOpenTestsV1_2();
    }
  });

  function runOpenTestsV2_0() {
    const AOpensBWithWrongContext =
      "(2.0-AOpensBWithWrongContext) Received App timeout when opening app B with fake context, app b listening for different context";
    it.only(AOpensBWithWrongContext, async () => {
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

  function runOpenTestsV1_2() {
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
        assert.fail("No error was not thrown", documentation);
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
        assert.fail("No error was not thrown", documentation);
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

    const AOpensBMalformedContext = `(${prefix}AOpensBMalformedContext) App B listeners receive nothing when passing a malformed context`;
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
}
