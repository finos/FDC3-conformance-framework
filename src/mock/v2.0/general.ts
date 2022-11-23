import { closeWindowOnCompletion, onFdc3Ready, sendContextToTests } from './mock-functions'
import { Context, DesktopAgent } from 'fdc3_2_0';
declare let fdc3: DesktopAgent

onFdc3Ready().then(async () => {
    await closeWindowOnCompletion();
  
    const appControlChannel = await window.fdc3.getOrCreateChannel("app-control");
    // broadcast that this app has opened
    appControlChannel.broadcast({
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
        type: "fdc3-conformance-context-received",
        context: context,
      } as ContextToSend);
    });
  });
  
  export interface ContextToSend extends Context {
    context: Context;
  }
