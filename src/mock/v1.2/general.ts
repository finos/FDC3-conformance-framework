import { closeWindowOnCompletion, onFdc3Ready } from './mock-functions'
import { DesktopAgent } from "fdc3_1_2/dist/api/DesktopAgent";
import { Context } from 'fdc3_1_2';
declare let fdc3: DesktopAgent

onFdc3Ready().then(async () => {
    await closeWindowOnCompletion();

    fdc3.joinChannel("FDC3-Conformance-Channel").then(() => {
        // broadcast that this app has opened
        fdc3.broadcast({
            type: "fdc3-conformance-opened",
        });

        // Context listeners used by tests.
        fdc3.addContextListener("fdc3.testReceiver", (context) => {
            // broadcast that this app has received context
            fdc3.broadcast({
                type: "fdc3-conformance-context-received",
                context: context,
            } as Context);
        });

        fdc3.addContextListener("fdc3.testReceiverMultiple", (context) => {
            // broadcast that this app has received context
            fdc3.broadcast({
                type: "fdc3-conformance-context-received-multiple",
                context: context,
            } as Context);
        });
    });
});
