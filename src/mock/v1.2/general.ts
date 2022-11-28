import { closeWindowOnCompletion, onFdc3Ready } from "./mock-functions";
import { DesktopAgent } from "fdc3_1_2/dist/api/DesktopAgent";
import { Context } from "fdc3_1_2";
import { sendContextToTests } from "../v1.2/mock-functions";
declare let fdc3: DesktopAgent;

export async function doGeneral() {
  console.log("setting up close window")
  await closeWindowOnCompletion();
  // broadcast that this app has opened

  console.log("sending back context")
  await sendContextToTests({
    type: "fdc3-conformance-opened",
  });

  // Context listeners used by tests.
  console.log("testReceiver listener")
  fdc3.addContextListener("fdc3.testReceiver", async (context) => {
    // broadcast that this app has received context
    await sendContextToTests({
      type: "fdc3-conformance-context-received",
      context: context,
    } as ContextToSend);
  });

  console.log("testReceiverMultiple listener")
  fdc3.addContextListener("fdc3.testReceiverMultiple", async (context) => {
    // broadcast that this app has received multiple context
    await sendContextToTests({
      type: "fdc3-conformance-context-received-multiple",
      context: context,
    } as ContextToSend);
  });
}

onFdc3Ready().then(doGeneral);

export interface ContextToSend extends Context {
  context: Context;
}


const button = document.createElement("button");
const text = document.createTextNode("Again");
button.appendChild(text);
document.body.appendChild(button);
button.onclick = doGeneral