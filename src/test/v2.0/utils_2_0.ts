import { Context, DesktopAgent } from "fdc3_2_0";
import constants from "../../constants";
import { sleep } from "../../utils";

declare let fdc3: DesktopAgent;

export async function closeMockAppWindow() {
  await broadcastCloseWindow();
  await waitForMockAppToClose();
}

const broadcastCloseWindow = async () => {
  const appControlChannel = await fdc3.getOrCreateChannel(constants.ControlChannel);
  await appControlChannel.broadcast({ type: "closeWindow" });
};

async function waitForMockAppToClose() {
  let timeout;
  const messageReceived = new Promise<Context>(async (resolve, reject) => {
    const appControlChannel = await fdc3.getOrCreateChannel(constants.ControlChannel);
    const listener = await appControlChannel.addContextListener("windowClosed", (context) => {
      resolve(context);
      clearTimeout(timeout);
      listener.unsubscribe();
    });

    //if no context received reject promise
    const { promise: sleepPromise, timeout: theTimeout } = sleep();
    timeout = theTimeout;
    await sleepPromise;
    reject(new Error("windowClosed context not received from app B"));
  });

  return messageReceived;
}
