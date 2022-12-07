import {
  closeWindowOnCompletion,
  onFdc3Ready,
  sendContextToTests,
  validateContext,
} from "./mock-functions";
import { Context, DesktopAgent } from "fdc3_2_0";
declare let fdc3: DesktopAgent;

//used in '2.0-PrivateChannelsLifecycleEvents'
onFdc3Ready().then(async () => {
  await closeWindowOnCompletion();
  let contextStreamNumber = 1;

  fdc3.addIntentListener("kTestingIntent", async (context) => {
    validateContext(context.type, "testContextX");
    const privChan = await fdc3.createPrivateChannel();

    privChan.onAddContextListener(async (contextType) => {
      //stream multiple contexts to test in short succession
      for (let i = 0; i < 4; i++) {
        let intentKContext: IntentKContext = {
          type: contextType,
          number: contextStreamNumber,
        };

        contextStreamNumber++;

        await sendContextToTests(intentKContext);
      }
    });

    await privChan.onUnsubscribe(async (contextType) => {
      //let test know onUnsubscribe was triggered
      await sendContextToTests({ type: "onUnsubscribeTriggered" });
    });

    await privChan.onDisconnect(async () => {
      //let test know onUnsubscribe was triggered
      await sendContextToTests({ type: "onDisconnectTriggered" });
    });

    await privChan.addContextListener("testContextX", async () => {
      await sendContextToTests({ type: "testContextX" }); //let test know addContextListener was triggered
    });

    return privChan;
  });
});

export interface IntentKContext extends Context {
  number?: number;
  onUnsubscribedTriggered?: boolean;
}
