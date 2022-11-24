import { DesktopAgent } from "fdc3_2_0/dist/api/DesktopAgent";
import { AppControlContext } from "../../test/common/channel-control";

declare let fdc3 : DesktopAgent

export const onFdc3Ready = () =>
  new Promise((resolve) => {
    if (window.fdc3) {
      resolve(undefined);
    } else {
      window.addEventListener("fdc3Ready", () => resolve(undefined));
    }
  });

export const closeWindowOnCompletion = async () => {
  const appControlChannel = await fdc3.getOrCreateChannel("app-control");
  await appControlChannel.addContextListener("closeWindow", async (context : AppControlContext) => {
    //notify app A that window was closed
    await appControlChannel.broadcast({
      type: "windowClosed",
      testId: context.testId,
    } as AppControlContext);
    setTimeout(() => {
      //yield to make sure the broadcast gets out before we close
      window.close();
      return;
    }, 5);
  });
};

export const sendContextToTests = async(context) =>{
  const appControlChannel = await fdc3.getOrCreateChannel(
    "app-control"
  );
  await appControlChannel.broadcast(context);
}