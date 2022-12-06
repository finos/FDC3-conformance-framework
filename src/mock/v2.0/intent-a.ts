import { closeWindowOnCompletion, onFdc3Ready, validateContext } from "./mock-functions";
import { DesktopAgent } from "fdc3_2_0/dist/api/DesktopAgent";
import { sendContextToTests } from "../v2.0/mock-functions";
import { wait } from "../../utils";
import { DelayedReturnContext } from "../../test/v2.0/advanced/intent-support-2.0";
import { IntentResult } from "fdc3_2_0";
declare let fdc3: DesktopAgent;

onFdc3Ready().then(async () => {
  await closeWindowOnCompletion();

  //used in 'Raise Intent Result (void result)' and 'Raise Intent (Ignoring any results)'
  fdc3.addIntentListener("aTestingIntent", async (context: DelayedReturnContext) : Promise<IntentResult> => {
    validateContext(context.type, "testContextX");
    if(context.delayBeforeReturn){
      await wait(context.delayBeforeReturn);
    }
    
    return;
  });
  fdc3.addIntentListener("sharedTestingIntent1", async (context) => {
    validateContext(context.type, "testContextX");
    return context;
  });

  //broadcast that intent-a has opened
  await sendContextToTests({
    type: "fdc3-intent-a-opened",
  });
});
