import { closeWindowOnCompletion, onFdc3Ready } from "./mock-functions";
import { DesktopAgent } from "fdc3_1_2/dist/api/DesktopAgent";
import { Context } from "fdc3_1_2";
import { sendContextToTests } from "../v1.2/mock-functions";
import { createAgent } from '@connectifi/agent-web';

declare let fdc3: DesktopAgent;

const cfiStart = async () => {
  const api = await createAgent(
      'https://nicholaskolba.connectifi-interop.com',
      'MockApp@Conformance-1.2',
  );

  window.fdc3 = api;
  document.dispatchEvent(new CustomEvent('fdc3Ready'));
  await closeWindowOnCompletion();
  // broadcast that this app has opened

  await sendContextToTests({
    type: "fdc3-conformance-opened",
  });

  // Context listeners used by tests.
  fdc3.addContextListener("fdc3.testReceiver", async (context) => {
    // broadcast that this app has received context
    await sendContextToTests({
      type: "fdc3-conformance-context-received",
      context: context,
    } as ContextToSend);
  });

  fdc3.addContextListener("fdc3.testReceiverMultiple", async (context) => {
    // broadcast that this app has received multiple context
    await sendContextToTests({
      type: "fdc3-conformance-context-received-multiple",
      context: context,
    } as ContextToSend);
  });
};

cfiStart();

export interface ContextToSend extends Context {
  context: Context;
}
