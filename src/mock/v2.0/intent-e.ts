import {
    closeWindowOnCompletion,
    onFdc3Ready,
    sendContextToTests,
  } from "./mock-functions";
  import { Context, DesktopAgent } from "fdc3_2_0";
import fdc3GetOrCreateChannel from "../../test/v1.2/basic/fdc3.getOrCreateChannel";
import { wait } from "../../utils";

  declare let fdc3: DesktopAgent;
  let stats = document.getElementById("context");
stats.innerHTML = "I'm here/ ";
  
  onFdc3Ready().then(async () => {
    await closeWindowOnCompletion();
    fdc3.addIntentListener("sharedTestingIntent2", async (context) => {
      stats.innerHTML = "I'm here/ ";
        const channel = await fdc3.getOrCreateChannel("test-channel");
        return channel;
    });

    await wait();
    await fdc3.broadcast({type: "testContextZ", id: {key: "uniqueId"}});
  });