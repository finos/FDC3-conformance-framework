import { closeWindowOnCompletion, onFdc3Ready } from './mock-functions'
import { Context, DesktopAgent } from 'fdc3_2_0';
declare let fdc3: DesktopAgent

onFdc3Ready().then(async () => {
    await closeWindowOnCompletion();

    window.fdc3.joinChannel("FDC3-Conformance-Channel").then(() => {
        // broadcast that this app has opened
        window.fdc3.broadcast({
            type: "fdc3-conformance-opened",
        });

        // Context listeners used by tests.
        window.fdc3.addContextListener("fdc3.testReceiver", (context) => {
            // broadcast that this app has received context
            window.fdc3.broadcast({
                type: "fdc3-conformance-context-received",
                context: context,
            } as Context);
        });

        window.fdc3.addContextListener("fdc3.testReceiverMultiple", (context) => {
            // broadcast that this app has received context
            window.fdc3.broadcast({
                type: "fdc3-conformance-context-received-multiple",
                context: context,
            } as Context);
        });
    });
});
