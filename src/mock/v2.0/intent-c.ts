import {
  closeWindowOnCompletion,
  MockAppContext,
  onFdc3Ready,
} from "./mock-functions";
import { DesktopAgent } from "fdc3_2_0/dist/api/DesktopAgent";
import { sendContextToTests } from "../v2.0/mock-functions";
import { ContextToSend } from "./general";
declare let fdc3: DesktopAgent;
console.log(`REACHED`);
onFdc3Ready().then(async () => {
  console.log(`REACHED`);
  await closeWindowOnCompletion();

  try {
    await fdc3.addContextListener(null, async (context) => {
      // broadcast that this app has received context
      if (context.type === "fdc3.instrument") {
        await sendContextToTests({
          type: "context-received",
          context: context,
        } as ContextToSend);
      }
    });
  } catch (ex) {
    await sendContextToTests({
      type: "context-received",
      errorMessage: `${ex.message ?? ex}`,
    } as MockAppContext);
  }

  fdc3.addIntentListener("cTestingIntent", async (context) => {
    return context;
  });
});
