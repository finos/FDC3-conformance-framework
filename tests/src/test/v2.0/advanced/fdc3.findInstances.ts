import { assert, expect } from "chai";
import APIDocumentation from "../../../apiDocuments";
import { DesktopAgent } from "fdc3_2_0/dist/api/DesktopAgent";
import { Context } from "fdc3_2_0";
import constants from "../../../constants";
import { sleep, wait } from "../../../utils";

const fdc3 = <DesktopAgent>(<unknown>window.fdc3);
const findInstancesDocs =
  "\r\nDocumentation: " + APIDocumentation.findInstances + "\r\nCause";

export default () =>
  describe("fdc3.findInstances", () => {
    afterEach(async () => {
      await broadcastCloseWindow();
      await waitForMockAppToClose();
    });

    it("valid metadata", async () => {
      let timeout;
      try {
        let listenerReceived = false;
        //start A and retrieve its AppIdentifier
        const appIdentifier = await fdc3.open({
          appId: "MockAppId",
        });

        //start A again and retrieve another AppIdentifier
        let appIdentifier2 = await fdc3.open({
          appId: "MockAppId",
        });

        //confirm that the instanceId for both app instantiations is different
        expect(
          appIdentifier.instanceId,
          `The AppIdentifier's instanceId property for both instances of the opened app should not be the same.${findInstancesDocs}`
        ).to.not.equal(appIdentifier2.instanceId);

        //retrieve instance details
        let instances = await fdc3.findInstances({ appId: "MockAppId" });

        if (
          !instances.includes(appIdentifier) ||
          !instances.includes(appIdentifier2)
        ) {
          assert.fail(
            `At least one AppIdentifier is missing from the array returned after calling fdc3.findInstances(app: AppIdentifier)${findInstancesDocs}`
          );
        }

        //ensure appIdentifier receives the raised intent
        await fdc3.addIntentListener("aTestingIntent", (context, metadata) => {
          expect(
            metadata.source,
            "The raised intent was not received by the mock app"
          ).to.be.equals(appIdentifier);
          expect(
            resolution.source,
            "IntentResolution.source did not match the mock app's AppIdentifier"
          ).to.be.equals(appIdentifier);
          listenerReceived = true;
          clearTimeout(timeout);
        });

        //raise an intent and target appIdentifier
        const resolution = await fdc3.raiseIntent(
          "aTestingIntent",
          { type: "testContextX" },
          appIdentifier
        );

        const {promise: sleepPromise, timeout: theTimeout} = sleep();
        timeout = theTimeout;
        await sleepPromise;
        if (!listenerReceived)
          assert.fail("The intent listener did not receive the raised intent");
      } catch (ex) {
        assert.fail(findInstancesDocs + (ex.message ?? ex));
      }
    });
  });

async function waitForMockAppToClose() {
  let timeout;
  const messageReceived = new Promise<Context>(async (resolve, reject) => {
    const appControlChannel = await fdc3.getOrCreateChannel("app-control");
    const listener = await appControlChannel.addContextListener(
      "windowClosed",
      async (context) => {
        await wait(constants.WindowCloseWaitTime);
        resolve(context);
        listener.unsubscribe();
      }
    );

    //if no context received reject promise
    const {promise: sleepPromise, timeout: theTimeout} = sleep();
    timeout = theTimeout;
    await sleepPromise;
    reject(new Error("windowClosed context not received from app B"));
  });

  return messageReceived;
}

const broadcastCloseWindow = async () => {
  const appControlChannel = await fdc3.getOrCreateChannel("app-control");
  await appControlChannel.broadcast({ type: "closeWindow" });
};
