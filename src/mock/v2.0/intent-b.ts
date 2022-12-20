import { closeWindowOnCompletion, onFdc3Ready } from "./mock-functions";
import { DesktopAgent } from "fdc3_2_0/dist/api/DesktopAgent";
import { sendContextToTests } from "../v2.0/mock-functions";
import { MockAppContext } from "../../test/common/open-control";
declare let fdc3: DesktopAgent;

onFdc3Ready().then(async () => {
  await closeWindowOnCompletion();

  //AOpensBMultipleListen & AOpensBMalformedContext: this should never get hit
  await fdc3.addContextListener("fdc3.contact", async (context) => {
    let errorMessage;
    if (context.type === "fdc3.intrument") {
      errorMessage = "App B listener received fdc3.contact context. Expected fdc3.instrument";
    } else if (context.name === "this is a malformed context") {
      errorMessage = "App B listener received a malformed context";
    }

    await sendContextToTests({
      type: "context-received",
      errorMessage: errorMessage,
    } as MockAppContext);
  });

  try {
    //used in AOpensBMultipleListen & AOpensBMalformedContext
    await fdc3.addContextListener(null, async (context) => {
      // broadcast that this app has received context
      if (context.type === "fdc3.instrument") {
        await sendContextToTests({
          type: "context-received",
          context: context,
        } as MockAppContext);
      } else if (context.name === "this is a malformed context") {
        await sendContextToTests({
          type: "context-received",
          errorMessage: "App B listener received a malformed context",
        } as MockAppContext);
      }
    });
  } catch (ex) {
    await sendContextToTests({
      type: "context-received",
      errorMessage: `${ex.message ?? ex}`,
    } as MockAppContext);
  }

  await fdc3.addIntentListener("bTestingIntent", async (context) => {
    return context;
  });
  await fdc3.addIntentListener("sharedTestingIntent1", async (context) => {
    return context;
  });

  //broadcast that intent-a has opened
  await sendContextToTests({
    type: "fdc3-intent-b-opened",
  });
});
