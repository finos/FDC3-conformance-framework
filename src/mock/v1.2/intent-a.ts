import { closeWindowOnCompletion, onFdc3Ready } from "./mock-functions";
import { DesktopAgent } from "fdc3_1_2/dist/api/DesktopAgent";
import { sendContextToTests } from "../v1.2/mock-functions";
import { AppControlContext } from "../../test/common/common-types";
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
  fdc3.addIntentListener("aTestingIntent", async (context) => {
    return context;
  });
  fdc3.addIntentListener("sharedTestingIntent1", (context) => {
    return context;
  });

  //broadcast that intent-a has opened
  await sendContextToTests({
    type: "fdc3-intent-a-opened",
  });
});
