import { closeWindowOnCompletion, onFdc3Ready } from './mock-functions'
import { DesktopAgent } from "fdc3_1_2/dist/api/DesktopAgent";
import { Context } from 'fdc3_1_2';
declare let fdc3: DesktopAgent

onFdc3Ready().then(async () => {
    await closeWindowOnCompletion();
    window.fdc3.addIntentListener("aTestingIntent", async (context) => {
        return context;
    });
    window.fdc3.addIntentListener("sharedTestingIntent1", async (context) => {
        return context;
    });

    window.fdc3.joinChannel("fdc3.raiseIntent").then(() => {
        window.fdc3.broadcast({
            type: "fdc3-intent-a-opened",
        });
    });
});
