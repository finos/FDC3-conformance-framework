import {
  closeWindowOnCompletion,
  onFdc3Ready,
} from "./mock-functions";
import { DesktopAgent } from "fdc3_2_0/dist/api/DesktopAgent";
import { Context } from "fdc3_2_0";
import { sendContextToTests } from "../v2.0/mock-functions";
import { MockAppContext } from "../../test/common/open-control";
declare let fdc3: DesktopAgent;

onFdc3Ready().then(async () => {
  await closeWindowOnCompletion();
  const implementationMetadata = await fdc3.getInfo();
  let { appId } = implementationMetadata.appMetadata;

  let appOpenedContext: MockAppContext = {
    type: "fdc3-conformance-opened",
  };

  if (appId !== "MockAppId") {
    appOpenedContext.errorMessage = `Incorrect appId retrieved from getInfo(). Expected MockAppId, got ${appId}`;
  }

  // broadcast that this app has opened
  await sendContextToTests(appOpenedContext as MockAppContext);

  // Context listeners used by tests.
  await fdc3.addContextListener("fdc3.testReceiver", async (context) => {
    // broadcast that this app has received context
    await sendContextToTests({
      type: "fdc3-conformance-context-received",
      context: context,
    } as ContextToSend);
  });

  // Context listeners used by tests.
  await fdc3.addContextListener("fdc3.contact", async (context) => {
    let errorMessageContext: MockAppContext = {
      type: "context-received",
      errorMessage: "Listener for fdc3.contact received fdc3.instrument context"
    };
    // broadcast that this app has received context
    await sendContextToTests(errorMessageContext as MockAppContext);
  });

  // Context listeners used by tests.
  await fdc3.addContextListener("fdc3.intrument", async (context) => {
    // broadcast that this app has received context
    await sendContextToTests({
      type: "context-received",
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
});

export interface ContextToSend extends Context {
  context: Context;
}
