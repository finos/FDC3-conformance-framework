import { closeWindowOnCompletion, onFdc3Ready, sendContextToTests } from "./mock-functions";
import { DesktopAgent } from "fdc3_2_0";
import { MetadataAppCommandContext } from "../../test/v2.0/advanced/fdc3.findInstances";
import { Intent } from "../../test/v2.0/advanced/intent-support-2.0";
declare let fdc3: DesktopAgent;

onFdc3Ready().then(async () => {
  await closeWindowOnCompletion();

  //get context from tests
  await fdc3.addContextListener("metadataAppContext", async (context: MetadataAppCommandContext) => {
    //execute command from test app and send back metadata
    if (context.command === "sendGetInfoMetadataToTests") {
      const implMetadata = await fdc3.getInfo();
      const metadataContext = {
        type: "metadataContext",
        implMetadata: implMetadata,
      };
      sendContextToTests(metadataContext);
    } else if (context.command === "sendIntentMetadataToTests") {
      await fdc3.addIntentListener(Intent.aTestingIntent, (context, metadata) => {
        const metadataContext = {
          type: "metadataContext",
          contextMetadata: metadata,
        };
        sendContextToTests(metadataContext);
      });
    }
  });
});
