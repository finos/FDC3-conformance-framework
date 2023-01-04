import { closeWindowOnCompletion, onFdc3Ready } from "./mock-functions";
import { DesktopAgent } from "fdc3_2_0/dist/api/DesktopAgent";
import { sendContextToTests } from "../v2.0/mock-functions";
import { wait } from "../../utils";
import { AppControlContext, IntentUtilityContext } from "../../test/common/common-types";
declare let fdc3: DesktopAgent;
onFdc3Ready().then(async () => {
  await closeWindowOnCompletion();

  try {
    //used in AOpensBMultipleListen
    await fdc3.addContextListener(null, async (context) => {
      // broadcast that this app has received context
      if (context.type === "fdc3.instrument") {
        await sendContextToTests({
          type: "context-received",
          context: context,
        } as AppControlContext);
      }
    });
  } catch (ex) {
    await sendContextToTests({
      type: "context-received",
      errorMessage: `${ex.message ?? ex}`,
    } as AppControlContext);
  }

  //used in 'RaiseIntentContextResult5secs'
  await fdc3.addIntentListener("sharedTestingIntent1", async (context: IntentUtilityContext) => {
    if (context.delayBeforeReturn > 0) {
      await wait(context.delayBeforeReturn);
    }

    await sendContextToTests({
      type: "sharedTestingIntent1-listener-triggered",
    });

    return context;
  });
});
