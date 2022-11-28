import {
  closeWindowOnCompletion,
  onFdc3Ready,
} from "./mock-functions";
import { DesktopAgent } from "fdc3_2_0/dist/api/DesktopAgent";
import { sendContextToTests } from "../v2.0/mock-functions";
import { MockAppContext } from "../../test/v2.0/advanced/open-support-2.0";
declare let fdc3: DesktopAgent;
console.log(`REACHED`);
onFdc3Ready().then(async () => {
  console.log(`REACHED`);
  await closeWindowOnCompletion();
  await fdc3.addContextListener("shouldNotReceiveThisContext", async (context) => {
    // broadcast that this app has received context
    if (context.type === "fdc3.instrument") {
      await sendContextToTests({
        type: "context-received",
        errorMessage: `Listener received incorrect context type. Listener listening for 'shouldNotReceiveThisContext' type received '${context.type}' type`,
      } as MockAppContext);
    }
  });
});
