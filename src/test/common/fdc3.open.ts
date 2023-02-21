import { assert } from "chai";
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
  it.only(AOpensBMultipleListen, async () => {
    let context: any, targetApp: any;
    context = { type: "fdc3.instrument", name: "context" };
    targetApp = { name: openApp.b.name, appId: openApp.b.id};
    const receiver = control.contextReceiver("context-received");
    await control.openMockAppNew(targetApp, context);
    await receiver;
    await control.inValidateReceivedContext(await receiver, "fdc3.contact");
    await control.validateReceivedContext(await receiver, "fdc3.instrument");
    await control.closeMockApp(AOpensBMultipleListen);
  });
}
