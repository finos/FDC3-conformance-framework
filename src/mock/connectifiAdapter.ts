import { createAgent } from '@connectifi/agent-web';

const connect = async () => {
    const api = await createAgent(
        'https://nicholaskolba.connectifi-interop.com',
        'IntentAppA@Conformance-1.2',
    );

    console.log("connectifi ready");
    window.fdc3 = api;
    window.dispatchEvent(new CustomEvent('fdc3Ready'));
}

document.addEventListener("DOMContentLoaded", connect);
//connect();
