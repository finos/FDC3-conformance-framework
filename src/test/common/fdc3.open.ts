import { assert } from "chai";
import constants from "../../constants";
import { runOpenTestsV1_2 } from "../v1.2/advanced/fdc3.open";
import { runOpenTestsV2_0 } from "../v2.0/advanced/fdc3.open";
import { expectAppTimeoutErrorOnOpen } from "../v2.0/advanced/open-support-2.0";
import { openApp, OpenControl } from "./open-control";

export function createOpenTests(
  control: OpenControl<any>,
  documentation: string,
  fdc3Version: string
): Mocha.Suite {
  let prefix = "";
  let target;
  let target2;

  if (fdc3Version === "2.0") {
    prefix = "2.0-";
    target = "AppIdentifier";
    target2 = "AppIdentifier";
  } else {
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

    //run v1.2-only and v2.0-only tests respectively, depending on which is being tested
    if (fdc3Version === "2.0") {
      runOpenTestsV2_0();
    } else if (fdc3Version === "1.2") {
      runOpenTestsV1_2();
    }
  });
}
