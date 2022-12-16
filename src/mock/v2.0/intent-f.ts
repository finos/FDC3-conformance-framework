import { closeWindowOnCompletion, onFdc3Ready, sendContextToTests, validateContext } from "./mock-functions";
import { Context, DesktopAgent } from "fdc3_2_0";
import { wait } from "../../utils";
declare let fdc3: DesktopAgent;

//used in '2.0-RaiseIntentPrivateChannelResult'
onFdc3Ready().then(async () => {
  await closeWindowOnCompletion();
  fdc3.addIntentListener("sharedTestingIntent2", async (context) => {
    validateContext(context.type, "testContextY");
    const privateChannel = await fdc3.createPrivateChannel();
    return privateChannel;
  });

  const { appMetadata } = await fdc3.getInfo();

  await wait();
  await sendContextToTests({ type: "testContextZ", id: { key: "uniqueId" }, instanceId: appMetadata.instanceId });
});
