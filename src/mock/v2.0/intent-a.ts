import { closeWindowOnCompletion, onFdc3Ready } from "./mock-functions";
import { DesktopAgent } from "fdc3_2_0/dist/api/DesktopAgent";
import { sendContextToTests } from "../v2.0/mock-functions";
import { ContextToSend } from "./general";
declare let fdc3: DesktopAgent;

onFdc3Ready().then(async () => {
  await closeWindowOnCompletion();
  await fdc3.addContextListener("fdc3.instrument", async (context) => {
    // broadcast that this app has received context
    await sendContextToTests({
      type: "context-received",
      context: context,
    } as ContextToSend);
  });
  
  fdc3.addIntentListener("aTestingIntent", async (context) => {
    return context;
  });
  fdc3.addIntentListener("sharedTestingIntent1", async (context) => {
    return context;
  });

  //broadcast that intent-a has opened
  await sendContextToTests({
    type: "fdc3-intent-a-opened",
  });
});