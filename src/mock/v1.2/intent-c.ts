import { closeWindowOnCompletion, onFdc3Ready } from './mock-functions'
import { DesktopAgent } from "fdc3_1_2/dist/api/DesktopAgent";
import { Context } from 'fdc3_1_2';
declare let fdc3: DesktopAgent

onFdc3Ready().then(async () => {
    await closeWindowOnCompletion();
    fdc3.addIntentListener('cTestingIntent', async (context) => {
        return context;
    });

    fdc3.joinChannel("fdc3.raiseIntent").then(() => {
        fdc3.broadcast({
            type: "fdc3-intent-c-opened",
        });
        fdc3.addContextListener("fdc3.genericListener", (context) => {
            // broadcast that this app has received context
            fdc3.broadcast({
                type: "fdc3-conformance-context-received",
                context: context,
            } as Context);
        });
    });
});
