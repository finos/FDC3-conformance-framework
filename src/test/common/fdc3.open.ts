import { assert } from "chai";
import constants from "../../constants";
import { openApp, OpenCommonConfig, OpenControl } from "./control/open-control";

export function getCommonOpenTests(control: OpenControl<any>, documentation: string, config: OpenCommonConfig) {
  
  const AOpensBWithSpecificContext = `(${config.prefix}AOpensBWithSpecificContext) Can open app B from app A with context and ${config.targetMultiple} as config.target and app B is expecting context`;
  it(AOpensBWithSpecificContext, async () => {
    let context: any, targetApp: any;
    context = { type: "fdc3.instrument", name: "context" };
    targetApp = { name: openApp.b.name, appId: openApp.b.id};
    const receiver = control.contextReceiver("context-received");
    await control.openMockAppNew(targetApp, context);
    await control.validateReceivedContext(await receiver, "fdc3.instrument");
    await control.closeMockApp(AOpensBWithSpecificContext);
  });

  const AOpensBMultipleListen = `(${config.prefix}AOpensBMultipleListen) Can open app B from app A with context and ${config.targetMultiple} as config.target but app B has multiple listeners added before the correct one`;
  it(AOpensBMultipleListen, async () => {
    let context: any, targetApp: any;
    context = { type: "fdc3.instrument", name: "context" };
    targetApp = { name: openApp.b.name, appId: openApp.b.id};
    const receiver = control.contextReceiver("context-received");
    await control.openMockAppNew(targetApp, context);
    await receiver;
    await control.validateReceivedContext(await receiver, "fdc3.instrument");
    await control.closeMockApp(AOpensBMultipleListen);
  });

  const AOpensBWithWrongContext = `(${config.prefix}AOpensBWithWrongContext) Received App timeout when opening app B with fake context, app b listening for different context`;
  it(AOpensBWithWrongContext, async () => {
    await control.addListenerAndFailIfReceived();
    await control.expectAppTimeoutErrorOnOpen(openApp.b.name);
    await control.closeMockApp(AOpensBWithWrongContext);
  }).timeout(constants.NoListenerTimeout + 1000);
}
