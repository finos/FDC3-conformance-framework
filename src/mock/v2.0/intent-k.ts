import { closeWindowOnCompletion, onFdc3Ready, sendContextToTests, validateContext } from "./mock-functions";
import { DesktopAgent } from "fdc3_2_0";
import { wait } from "../../utils";
import { IntentUtilityContext } from "../../test/common/common-types";
import constants from "../../constants";
import { ContextTypes, Intents } from "../../test/v2.0/advanced/intent-support-2.0";
declare let fdc3: DesktopAgent;

//used in '2.0-PrivateChannelsLifecycleEvents'
onFdc3Ready().then(async () => {
  await closeWindowOnCompletion();

  fdc3.addIntentListener(Intents.kTestingIntent, async (context) => {
    validateContext(context.type, ContextTypes.testContextX);
    const privChan = await fdc3.createPrivateChannel();

    await privChan.addContextListener(ContextTypes.testContextX, async () => {
      await sendContextToTests({ type: ContextTypes.testContextX }); //let test know addContextListener was triggered
    });

    let contextStreamNumber = 1;
    privChan.onAddContextListener(async (contextType) => {
      await wait(100); //wait for listener in test to initialise

      //stream multiple contexts to test in short succession
      for (let i = 0; i < 5; i++) {
        let intentKContext: IntentUtilityContext = {
          type: ContextTypes.testContextZ,
          number: contextStreamNumber,
        };

        await privChan.broadcast(intentKContext);
        contextStreamNumber++;

        //give broadcast time to run
        await wait(50);
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

    return privChan;
  });
});
