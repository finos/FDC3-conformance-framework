import { closeWindowOnCompletion, onFdc3Ready } from "./mock-functions";
import { DesktopAgent } from "fdc3_2_0/dist/api/DesktopAgent";
import { sendContextToTests } from "../v2.0/mock-functions";
import { wait, wrapPromise } from "../../utils";
import { IntentAppBContext } from "../../test/v2.0/advanced/intent-support-2.0";
declare let fdc3: DesktopAgent;

onFdc3Ready().then(async () => {
  await closeWindowOnCompletion();
  // await fdc3.addIntentListener('bTestingIntent', async (context) => {
  //     return context;
  // });
  const wrapper = wrapPromise();
  let receivedContext: IntentAppBContext;
  await fdc3.addIntentListener(
    "sharedTestingIntent1",
    (context: IntentAppBContext) => {
      receivedContext = context;
      wrapper.resolve();
    }
  );

  await wrapper.promise;

  if (receivedContext) {
    await wait(receivedContext.delayBeforeReturn);
    await sendContextToTests(receivedContext);
    if (receivedContext.type === "testContextY") {
      return;
    } else if (receivedContext.type === "testContextX") {
      return receivedContext;
    }
  }

  //broadcast that intent-a has opened
  await sendContextToTests({
    type: "fdc3-intent-b-opened",
  });
});
