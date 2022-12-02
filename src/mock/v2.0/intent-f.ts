import {
    closeWindowOnCompletion,
    onFdc3Ready,
    sendContextToTests,
  } from "./mock-functions";
  import { Context, DesktopAgent } from "fdc3_2_0";
import { wait } from "../../utils";
  declare let fdc3: DesktopAgent;
  
  let stats = document.getElementById("context");
stats.innerHTML = "I'm here/ ";
  
  onFdc3Ready().then(async () => {
    await closeWindowOnCompletion();
    fdc3.addIntentListener("sharedTestingIntent2", async (context) => {
      stats.innerHTML = "I'm here/ ";
        const privateChannel = await fdc3.createPrivateChannel();
        return privateChannel;
    });

    await wait();
    await fdc3.broadcast({type: "testContextZ", id: {key: "uniqueId"}});
  });
  