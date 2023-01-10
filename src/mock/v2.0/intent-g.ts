import { closeWindowOnCompletion, onFdc3Ready } from "./mock-functions";
import { DesktopAgent } from "fdc3_2_0";
import { Intents } from "../../test/v2.0/advanced/intent-support-2.0";
declare let fdc3: DesktopAgent;

onFdc3Ready().then(async () => {
  await closeWindowOnCompletion();
  fdc3.addIntentListener(Intents.sharedTestingIntent2, async (context) => {
    return context;
  });
});
