const onFdc3Ready = () => new Promise((resolve) => {
    if (window.fdc3) {
        resolve();
    } else {
        window.addEventListener('fdc3Ready', () => resolve());
    }
});

const setupCloseListener = async (fdc3) => {
    const channel = await fdc3.getOrCreateChannel("fdc3.raiseIntent");
    await channel.addContextListener("closeWindow", async (context) => {
        // FDC3 application specific functions called here to close window
        closeFinsembleWindow();
    });
};

// https://documentation.finsemble.com/docs/smart-desktop/windows-and-workspaces/API-WindowClient/#close
const closeFinsembleWindow = async () => {
    if (FSBL) {
        await FSBL.Clients.WindowClient.close({
            removeFromWorkspace: false,
            closeWindow: false
        });
    }
};
