import { closeWindowOnCompletion, onFdc3Ready, sendContextToTests, validateContext } from "./mock-functions";
import { DesktopAgent } from "fdc3_2_0";
import { wait } from "../../utils";
import { ContextType, Intent } from "../../test/v2.0/support/intent-support-2.0";

declare let fdc3: DesktopAgent;

//used in '2.0-RaiseIntentChannelResult'
onFdc3Ready().then(async () => {
  await closeWindowOnCompletion();
  fdc3.addIntentListener(Intent.sharedTestingIntent2, async (context) => {
    validateContext(context.type, ContextType.testContextY);
    const channel = await fdc3.getOrCreateChannel("test-channel");
    return channel;
  });

  const { appMetadata } = await fdc3.getInfo();

  await wait(); // send context after short delay
  await sendContextToTests({ type: ContextType.testContextZ, id: { key: "uniqueId" }, instanceId: appMetadata.instanceId });
});
