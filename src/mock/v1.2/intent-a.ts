import { closeWindowOnCompletion, onFdc3Ready } from "./mock-functions";
import { DesktopAgent } from "fdc3_1_2/dist/api/DesktopAgent";
import { sendContextToTests } from "../v1.2/mock-functions";
import { createAgent } from '@connectifi/agent-web';

declare let fdc3: DesktopAgent;


const cfiStart = async () => {
  const api = await createAgent(
      'https://nicholaskolba.connectifi-interop.com',
      'IntentAppA@Conformance-1.2',
  );

  window.fdc3 = api;
  document.dispatchEvent(new CustomEvent('fdc3Ready'));

  await closeWindowOnCompletion();
  fdc3.addIntentListener("aTestingIntent", (context) => {
    return context;
  });
  fdc3.addIntentListener("sharedTestingIntent1", (context) => {
    return context;
  });

  //broadcast that intent-a has opened
  await sendContextToTests({
    type: "fdc3-intent-a-opened"
  });
};

cfiStart();