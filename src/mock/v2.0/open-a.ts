import {
  closeWindowOnCompletion,
  onFdc3Ready,
} from "./mock-functions";
import { DesktopAgent } from "fdc3_2_0/dist/api/DesktopAgent";
import { sendContextToTests } from "../v2.0/mock-functions";
import { MockAppContext } from "../../test/common/open-control";

declare let fdc3: DesktopAgent;
onFdc3Ready().then(async () => {
  await closeWindowOnCompletion();
  await fdc3.addContextListener("shouldNotReceiveThisContext", async (context) => {
    // broadcast that this app has received context
    if (context.type !== "shouldNotReceiveThisContext") {
      await sendContextToTests({
        type: "context-received",
        errorMessage: `Listener received incorrect context type. Listener listening for 'shouldNotReceiveThisContext' type received '${context.type}' type`,
      } as MockAppContext);
    }
  });
});
