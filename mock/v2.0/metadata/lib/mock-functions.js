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
   await appControlChannel.addContextListener("closeWindow", async (context) => {

      //notify app A that window was closed
      await appControlChannel.broadcast({
        type: "windowClosed",
        testId: context.testId,
      });
      setTimeout(() => {
        //yield to make sure the broadcast gets out before we close
        window.close();
        return;
      }, 5);
  });
};

const sendContextToTests = async (context) =>{
  const appControlChannel = await fdc3.getOrCreateChannel("app-control");
  await appControlChannel.broadcast(context);
};

