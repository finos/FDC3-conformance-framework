module.exports = {
    files: './dist/**/index.html',
    from: ['<!-- optional 1.2 app scripts -->', '<!-- optional 1.2 support scripts -->'],
    to: ` <script type="module" >
             import { createAgent } from "https://unpkg.com/@connectifi/agent-web@1.1.0/dist/main.js";
             const connect = async () => {
                  const api = await createAgent(
                     'https://dev.connectifi-interop.com',
                      '*@Conformance-1.2',
                  );
                  window.fdc3 = api;
                  window.dispatchEvent(new CustomEvent('fdc3Ready'));
              }
              
              document.addEventListener("DOMContentLoaded", connect);
        </script>
    `
};