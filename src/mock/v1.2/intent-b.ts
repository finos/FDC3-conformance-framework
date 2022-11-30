import { closeWindowOnCompletion, onFdc3Ready } from './mock-functions'
import { DesktopAgent } from "fdc3_1_2/dist/api/DesktopAgent";
import { sendContextToTests } from '../v2.0/mock-functions';
declare let fdc3: DesktopAgent

onFdc3Ready().then(async () => {
    await closeWindowOnCompletion();
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
});
