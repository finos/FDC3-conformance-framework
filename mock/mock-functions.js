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
    let {fdc3Version} = implementationMetadata;
    if(fdc3Version === "1.2"){
      await closeWindowOnCompletion_1_2();
    }else if(fdc3Version === "2.0"){
      await closeWindowOnCompletion_2_0();
    }
  }

const closeWindowOnCompletion_1_2 = async () => {
  const appControlChannel = await window.fdc3.getOrCreateChannel("app-control");
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

const closeWindowOnCompletion_2_0 = async () => {
  const appControlChannel = await window.fdc3.getOrCreateChannel("app-control");
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
  const promise = new Promise((resolve) => {
    timeout = window.setTimeout(() => {
      resolve();
    }, timeoutMs);
  });
  return { promise, timeout };
}

