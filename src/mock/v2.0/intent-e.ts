import {
  closeWindowOnCompletion,
  onFdc3Ready,
  sendContextToTests,
  validateContext,
} from "./mock-functions";
import { DesktopAgent } from "fdc3_2_0";
import { wait } from "../../utils";

declare let fdc3: DesktopAgent;

//used in 'Raise Intent Result (Channel results)'
onFdc3Ready().then(async () => {
  await closeWindowOnCompletion();
  fdc3.addIntentListener("sharedTestingIntent2", async (context) => {
    validateContext(context.type, "testContextY");
    const channel = await fdc3.getOrCreateChannel("test-channel");
    return channel;
  });

  await wait();
  await sendContextToTests({ type: "testContextZ", id: { key: "uniqueId" }})
});
