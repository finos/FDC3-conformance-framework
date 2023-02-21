import { createAgent } from '@connectifi/agent-web';

const connect = async () => {
  const appName = '*';
    const api = await createAgent(
       // 'https://newdev.connectifi-interop.com',
       'https://nicholaskolba.connectifi-interop.com',
        `${appName}@Conformance-1.2`,
    );

    console.log("connectifi ready");
    window.fdc3 = api;
    window.dispatchEvent(new CustomEvent('fdc3Ready'));
}

document.addEventListener("DOMContentLoaded", connect);
