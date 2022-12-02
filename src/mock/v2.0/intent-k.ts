import {
    closeWindowOnCompletion,
    onFdc3Ready,
    sendContextToTests,
  } from "./mock-functions";
  import { Context, DesktopAgent } from "fdc3_2_0";
  declare let fdc3: DesktopAgent;
  
  let stats = document.getElementById("context");
  stats.innerHTML = "I'm here/ ";
  
  onFdc3Ready().then(async () => {
    await closeWindowOnCompletion();
    let contextNumberStream = 1;
    
    fdc3.addIntentListener("kTestingIntent", async (context) => {
      if (context.type != "testContextX") {
        throw new Error(
          `Wrong context received from test. Expected testContextX, got ${context.type}`
        );
      }
  
    const privChan = await fdc3.createPrivateChannel();
  
    const listener1 = privChan.onAddContextListener(async (contextType) => {
      //stream multiple contexts to test in short succession
      for (let i = 0; i < 4; i++) {
        let intentKContext: IntentKContext = {
          type: contextType,
          number: contextNumberStream
        };
        
        contextNumberStream++;
  
        await sendContextToTests(intentKContext);
      }
    });
    const listener2 = await privChan.onUnsubscribe(async (contextType) => {
      let intentKContext: IntentKContext = {
        type: contextType,
        onUnsubscribedTriggered: true
      };
  
      //let test know onUnsubscribe was triggered
      await sendContextToTests(intentKContext);
    });
    const listener3 = await privChan.onDisconnect(() => {});
    const listener4 = await privChan.addContextListener("testContextX", () => {});
  
      return privChan;
    });
  });
  
  export interface IntentKContext extends Context {
    number?: number,
    onUnsubscribedTriggered?: boolean
  }
  