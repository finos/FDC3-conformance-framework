import { closeWindowOnCompletion, onFdc3Ready, sendContextToTests } from "./mock-functions";
import { DesktopAgent } from "fdc3_2_0";
import { AppControlContext } from "../../context-types";

declare let fdc3: DesktopAgent;

onFdc3Ready().then(async () => {
  await closeWindowOnCompletion();

  //get context from tests
  await fdc3.addContextListener("metadataAppContext", async (context) => {
    //execute command from test app and send back metadata
    const implMetadata = await fdc3.getInfo();
    const metadataContext = {
      type: "context-listener-triggered",
      implMetadata: implMetadata,
    };

    sendContextToTests(metadataContext);
  });

  // used in 'FindInstances'
  await fdc3.addIntentListener("aTestingIntent", async (context) => {
    const implMetadata = await fdc3.getInfo();
    const metadataAppContext: AppControlContext = {
      type: "intent-listener-triggered",
      instanceId: implMetadata.appMetadata.instanceId,
    };

    sendContextToTests(metadataAppContext);
    return context;
  });
});
