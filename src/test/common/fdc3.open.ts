import { assert } from "chai";
import { openApp, OpenCommonConfig, OpenControl } from "./open-control";

export function getCommonOpenTests(
  control: OpenControl<any>,
  documentation: string,
  config: OpenCommonConfig
) {
  const AOpensB1 = `(${config.prefix}AOpensB1) Can open app B from app A with ${config.target} as config.target`;
  it(AOpensB1, async () => {
    const result = control.contextReceiver("fdc3-conformance-opened");
    await control.openMockApp(openApp.b.name, undefined, undefined, true);
    await result;
    await control.closeAppWindows(AOpensB1);
  });

  it(`(${config.prefix}AFailsToOpenB) Receive AppNotFound error when config.targeting non-existent ${config.target} as config.target`, async () => {
    try {
      await control.openMockApp(
        "ThisAppDoesNotExist",
        undefined,
        undefined,
        true
      );
      assert.fail("No error was thrown", documentation);
    } catch (ex) {
      control.confirmAppNotFoundErrorReceived(ex);
    }
  });

  const AOpensBWithContext = `(${config.prefix}AOpensBWithContext) Can open app B from app A with context and ${config.target} as config.target but app B listening for null context`;
  it(AOpensBWithContext, async () => {
    const receiver = control.contextReceiver("context-received");
    await control.openMockApp(
      openApp.c.name,
      undefined,
      "fdc3.instrument",
      true
    );
    await control.validateReceivedContext(receiver, "fdc3.instrument");
    await control.closeAppWindows(AOpensBWithContext);
  });

  const AOpensBWithSpecificContext = `(${config.prefix}AOpensBWithSpecificContext) Can open app B from app A with context and ${config.targetMultiple} as config.target and app B is expecting context`;
  it(AOpensBWithSpecificContext, async () => {
    const receiver = control.contextReceiver("context-received");
    await control.openMockApp(openApp.b.name, undefined, "fdc3.instrument");

    await control.validateReceivedContext(receiver, "fdc3.instrument");
    await control.closeAppWindows(AOpensBWithSpecificContext);
  });

  const AOpensBMultipleListen = `(${config.prefix}AOpensBMultipleListen) Can open app B from app A with context and ${config.targetMultiple} as config.target but app B has multiple listeners added before the correct one`;
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
}
