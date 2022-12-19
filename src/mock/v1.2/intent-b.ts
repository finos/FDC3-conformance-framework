import { closeWindowOnCompletion, onFdc3Ready } from './mock-functions'
import { DesktopAgent } from "fdc3_1_2/dist/api/DesktopAgent";
import { sendContextToTests } from '../v2.0/mock-functions';
import { MockAppContext } from '../../test/common/open-control';
import { createAgent } from '@connectifi/agent-web';

declare let fdc3: DesktopAgent;

const cfiStart = async () => {
  const api = await createAgent(
      'https://nicholaskolba.connectifi-interop.com',
      'IntentAppB@Conformance-1.2',
  );

  window.fdc3 = api;
  document.dispatchEvent(new CustomEvent('fdc3Ready'));

  await closeWindowOnCompletion();

  try {
      //used in AOpensBMultipleListen & AOpensBMalformedContext
      await fdc3.addContextListener(null, async (context) => {
        // broadcast that this app has received context
        if (context.name === "this is a malformed context") {
          await sendContextToTests({
            type: "context-received",
            errorMessage: `App B listener received a malformed context. Context received = ${JSON.stringify(context)}`,
          } as MockAppContext);
        }
      });
    } catch (ex) {
      await sendContextToTests({
        type: "context-received",
        errorMessage: `${ex.message ?? ex}`,
      } as MockAppContext);
    }

  fdc3.addIntentListener('bTestingIntent', (context) => {
      return context;
  });
  fdc3.addIntentListener('sharedTestingIntent1', (context) => {
      return context;
  });

  //broadcast that intent-b has opened
  await sendContextToTests({
      type: "fdc3-intent-b-opened"
  });
};

cfiStart();