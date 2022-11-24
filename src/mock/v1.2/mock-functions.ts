import { DesktopAgent } from "fdc3_1_2/dist/api/DesktopAgent";
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
  appControlChannel.addContextListener("closeWindow", async (context : AppControlContext) => {
    //notify app A that window was closed
    appControlChannel.broadcast({
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
  appControlChannel.broadcast(context);
}
