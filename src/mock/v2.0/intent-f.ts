import { closeWindowOnCompletion, onFdc3Ready, sendContextToTests, validateContext } from "./mock-functions";
import { DesktopAgent } from "fdc3_2_0";
import { wait } from "../../utils";
import { ContextTypes } from "../../test/v2.0/advanced/intent-support-2.0";
declare let fdc3: DesktopAgent;

//used in '2.0-RaiseIntentPrivateChannelResult'
onFdc3Ready().then(async () => {
  await closeWindowOnCompletion();
  fdc3.addIntentListener("sharedTestingIntent2", async (context) => {
    validateContext(context.type, ContextTypes.testContextY);
    const privateChannel = await fdc3.createPrivateChannel();
    return privateChannel;
  });

  const { appMetadata } = await fdc3.getInfo();

  await wait(); // send context after short delay
  await sendContextToTests({ type: ContextTypes.testContextZ, id: { key: "uniqueId" }, instanceId: appMetadata.instanceId });
});
