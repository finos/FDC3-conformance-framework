import {
  closeWindowOnCompletion,
  onFdc3Ready,
  sendContextToTests,
  validateContext,
} from "./mock-functions";
import { Context, DesktopAgent } from "fdc3_2_0";
import { wait } from "../../utils";
import { IntentUtilityContext } from "../../test/v2.0/common-types";
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
        let intentKContext: IntentUtilityContext = {
          type: contextType,
          number: contextStreamNumber,
        };

        contextStreamNumber++;

        //give broadcast time to fire
        await wait(50);
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
