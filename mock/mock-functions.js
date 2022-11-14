const onFdc3Ready = () => new Promise((resolve) => {
  if (window.fdc3) {
      resolve();
  } else {
      window.addEventListener('fdc3Ready', () => resolve());
  }
});

const closeWindowOnCompletion = async (fdc3) => {
  const appControlChannel = await window.fdc3.getOrCreateChannel(
      "app-control"
    );
  appControlChannel.addContextListener("closeWindow", async (context) => {
      //notify app A that window was closed
      appControlChannel.broadcast({
        type: "windowClosed",
        testId: context.testId,
      });

      window.close();
  });
};
