import { closeWindowOnCompletion, onFdc3Ready } from "./mock-functions";
import { DesktopAgent } from "fdc3_1_2/dist/api/DesktopAgent";
import { sendContextToTests } from "../v1.2/mock-functions";
import { ContextSender } from "./general";
import { MockAppContext } from "../../test/common/open-control";
declare let fdc3: DesktopAgent;

onFdc3Ready().then(async () => {
  await closeWindowOnCompletion();
  fdc3.addIntentListener("cTestingIntent", (context) => {
    return context;
  });

  //broadcast that intent-a has opened
  await sendContextToTests({
    type: "fdc3-intent-c-opened",
  });

  try {
    await fdc3.addContextListener(null, async (context) => {
      // broadcast that this app has received context
      if (context.type === "fdc3.instrument") {
        await sendContextToTests({
          type: "context-received",
          context: context,
        } as ContextSender);
      }
    });
  } catch (ex) {
    await sendContextToTests({
      type: "context-received",
      errorMessage: `${ex.message ?? ex}`,
    } as MockAppContext);
  }
});
