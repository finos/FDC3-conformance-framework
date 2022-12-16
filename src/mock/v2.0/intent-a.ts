import { closeWindowOnCompletion, onFdc3Ready, validateContext } from "./mock-functions";
import { DesktopAgent } from "fdc3_2_0/dist/api/DesktopAgent";
import { sendContextToTests } from "../v2.0/mock-functions";
import { wait } from "../../utils";
import { IntentUtilityContext } from "../../test/common/common-types";
import { IntentResult } from "fdc3_2_0";
declare let fdc3: DesktopAgent;

onFdc3Ready().then(async () => {
  await closeWindowOnCompletion();

  //used in 'Raise Intent Result (void result)' and 'Raise Intent (Ignoring any results)'
  fdc3.addIntentListener("aTestingIntent", async (context: IntentUtilityContext): Promise<IntentResult> => {
    validateContext(context.type, "testContextX");
    if (context.delayBeforeReturn) {
      await wait(context.delayBeforeReturn);
    }

    sendContextToTests({
      type: "context-received",
    });

    return;
  });

  fdc3.addIntentListener("sharedTestingIntent1", async (context: IntentUtilityContext): Promise<IntentResult> => {
    validateContext(context.type, "testContextY");
    if (context.delayBeforeReturn && context.delayBeforeReturn > 0) {
      await wait(context.delayBeforeReturn);
    }

    sendContextToTests({
      type: "context-received",
    });

    return context;
  });

  const { appMetadata } = await fdc3.getInfo();

  //broadcast that intent-a has opened
  await sendContextToTests({
    type: "fdc3-intent-a-opened",
    instanceId: appMetadata.instanceId,
  });
});
