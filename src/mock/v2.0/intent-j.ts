import {
    closeWindowOnCompletion,
    onFdc3Ready,
    sendContextToTests,
  } from "./mock-functions";
  import { ChannelError, Context, DesktopAgent } from "fdc3_2_0";
  declare let fdc3: DesktopAgent;
  
  let stats = document.getElementById("context");
  stats.innerHTML = "I'm here/ ";
  
  onFdc3Ready().then(async () => {
    await closeWindowOnCompletion();
    fdc3.addIntentListener("privateChanneliIsPrivate", async (context) => {
      stats.innerHTML = "I'm here/ ";
      try {
        await fdc3.getOrCreateChannel(context.id.key);
        throw new Error(
          "No error thrown when calling fdc3.getOrCreateChannel('<idPassedInContext>')"
        );
      } catch (ex) {
        if (ex.message !== ChannelError.AccessDenied) {
          `Incorrect error received when calling fdc3.getOrCreateChannel('<idPassedInContext>'). Expected AccessDenied, got ${ex.message}`;
        }
      }
  
      return context;
    });
  });