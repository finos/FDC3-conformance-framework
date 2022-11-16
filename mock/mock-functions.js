const onFdc3Ready = () =>
  new Promise((resolve) => {
    if (window.fdc3) {
      resolve();
    } else {
      window.addEventListener("fdc3Ready", () => resolve());
    }
  });

const closeWindowOnCompletion = async (fdc3) => {
  let implementationMetadata = await fdc3.getInfo();
  let { fdc3Version } = implementationMetadata;
  const appControlChannel = await fdc3.getOrCreateChannel("app-control");
  if (fdc3Version === "1.2") {
    await closeWindowOnCompletion_1_2(appControlChannel);
  } else if (fdc3Version === "2.0") {
    await closeWindowOnCompletion_2_0(appControlChannel);
  }
};

const closeWindowOnCompletion_1_2 = async (appControlChannel) => {
  appControlChannel.addContextListener("closeWindow", async (context) => {
    //notify app A that window was closed
    appControlChannel.broadcast({
      type: "windowClosed",
      testId: context.testId,
    });
    await sleep(10);
    //yield to make sure the broadcast gets out before we close
    window.close();
  });
};

const closeWindowOnCompletion_2_0 = async (appControlChannel) => {
  await appControlChannel.addContextListener("closeWindow", async (context) => {
    //notify app A that window was closed
    await appControlChannel.broadcast({
      type: "windowClosed",
      testId: context.testId,
    });
    await sleep(10);
    //yield to make sure the broadcast gets out before we close
    window.close();
  });
};

async function sleep(timeoutMs) {
  let timeout;
  return new Promise((resolve) => {
    timeout = window.setTimeout(() => {
      resolve();
    }, timeoutMs);
  });
}
