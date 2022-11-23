import { closeWindowOnCompletion, onFdc3Ready } from "./mock-functions";
import { DesktopAgent } from "fdc3_1_2/dist/api/DesktopAgent";
import { Context } from "fdc3_1_2";
import { sendContextToTests } from "../v1.2/mock-functions";
import { ContextToSend } from "./general";
declare let fdc3: DesktopAgent;

onFdc3Ready().then(async () => {
  await closeWindowOnCompletion();
  fdc3.addIntentListener("cTestingIntent", async (context) => {
    return context;
  });

  //broadcast that intent-a has opened
  await sendContextToTests({
    type: "fdc3-intent-c-opened",
  });

  fdc3.addContextListener("fdc3.genericListener", async (context) => {
    // broadcast that this app has received context
    await sendContextToTests({
      type: "fdc3-conformance-context-received",
      context: context,
    } as ContextToSend);
  });
});
