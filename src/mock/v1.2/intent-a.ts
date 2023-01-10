import { closeWindowOnCompletion, onFdc3Ready } from "./mock-functions";
import { DesktopAgent } from "fdc3_1_2/dist/api/DesktopAgent";
import { sendContextToTests } from "../v1.2/mock-functions";
import { AppControlContext } from "../../test/common/common-types";
import { Intents } from "../../test/v2.0/advanced/intent-support-2.0";
declare let fdc3: DesktopAgent;

onFdc3Ready().then(async () => {
  await closeWindowOnCompletion();
  fdc3.addContextListener("fdc3.instrument", async (context) => {
    // broadcast that this app has received context
    await sendContextToTests({
      type: "context-received",
      context: context,
    } as AppControlContext);
  });
  fdc3.addIntentListener(Intents.aTestingIntent, async (context) => {
    return context;
  });
  fdc3.addIntentListener(Intents.sharedTestingIntent1, (context) => {
    return context;
  });

  //broadcast that intent-a has opened
  await sendContextToTests({
    type: "fdc3-intent-a-opened",
  });
});
