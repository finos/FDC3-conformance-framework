import { closeWindowOnCompletion, onFdc3Ready, validateContext } from "./mock-functions";
import { sendContextToTests } from "../v2.0/mock-functions";
import { wait } from "../../utils";
import { IntentUtilityContext } from "../../test/common/common-types";
import { IntentResult, DesktopAgent } from "fdc3_2_0";
import { ContextTypes, Intents } from "../../test/v2.0/advanced/intent-support-2.0";
declare let fdc3: DesktopAgent;

onFdc3Ready().then(async () => {
  await closeWindowOnCompletion();

  //used in 'Raise Intent Result (void result)' and 'Raise Intent (Ignoring any results)'
  fdc3.addIntentListener(Intents.aTestingIntent, async (context: IntentUtilityContext): Promise<IntentResult> => {
    validateContext(context.type, ContextTypes.testContextX);
    await delayExecution(context.delayBeforeReturn);

    const { appMetadata } = await fdc3.getInfo();

    await sendContextToTests({
      type: "aTestingIntent-listener-triggered",
      instanceId: appMetadata.instanceId,
    });

    return;
  });

  fdc3.addIntentListener(Intents.sharedTestingIntent1, async (context: IntentUtilityContext): Promise<IntentResult> => {
    validateContext(context.type, ContextTypes.testContextY);
    await delayExecution(context.delayBeforeReturn);

    await sendContextToTests({
      type: "sharedTestingIntent1-listener-triggered",
    });

    return context;
  });

  await sendContextToTests({
    type: "intent-app-a-opened",
  });
});

async function delayExecution(delayMiliseconds: number | undefined): Promise<void> {
  if (delayMiliseconds && delayMiliseconds > 0) {
    await wait(delayMiliseconds);
  }
}
