import { assert, expect } from "chai";
import APIDocumentation from "../../../apiDocuments";
import { DesktopAgent } from "fdc3_2_0/dist/api/DesktopAgent";
import { Context, ContextMetadata, ImplementationMetadata } from "fdc3_2_0";
import constants from "../../../constants";
import { sleep, wait, wrapPromise } from "../../../utils";

declare let fdc3: DesktopAgent;
const findInstancesDocs =
  "\r\nDocumentation: " + APIDocumentation.findInstances + "\r\nCause";

export default () =>
  describe("fdc3.findInstances", () => {
    afterEach(async () => {
      await broadcastCloseWindow();
      await waitForMockAppToClose();
    });

    it("(2.0-FindInstances) valid metadata", async () => {
      try {
        //start A and retrieve its AppIdentifier
        const appIdentifier = await fdc3.open({
          appId: "MetadataAppId",
        });

        //start A again and retrieve another AppIdentifier
        let appIdentifier2 = await fdc3.open({
          appId: "MetadataAppId",
        });

        //confirm that the instanceId for both app instantiations is different
        expect(
          appIdentifier.instanceId,
          `The AppIdentifier's instanceId property for both instances of the opened app should not be the same.${findInstancesDocs}`
        ).to.not.equal(appIdentifier2.instanceId);

        //retrieve instance details
        let instances = await fdc3.findInstances({ appId: "MetadataAppId" });

        if (
          !instances.includes(appIdentifier) ||
          !instances.includes(appIdentifier2)
        ) {
          assert.fail(
            `At least one AppIdentifier object is missing from the AppIdentifier array returned after calling fdc3.findInstances(app: AppIdentifier)${findInstancesDocs}`
          );
        }

        let timeout;
        const wrapper = wrapPromise();

        //ensure appIdentifier received the raised intent
        await fdc3.addContextListener(
          "metadataContext",
          (context: MetadataContext) => {
            clearTimeout(timeout);
            expect(
              context.contextMetadata.source,
              "ContextMetadata.source did not match the AppIdentifier of the first mock app that was opened"
            ).to.be.equals(appIdentifier);
            wrapper.resolve();
          }
        );

        const metadataAppContext = {
          type: "metadataAppContext",
          command: MetadataAppCommand.confirmRaisedIntentReceived,
        };

        //raise an intent and target appIdentifier
        const resolution = await fdc3.raiseIntent(
          "aTestingIntent",
          metadataAppContext,
          appIdentifier
        );

        expect(
          resolution.source,
          "IntentResolution.source did not match the mock app's AppIdentifier"
        ).to.be.equal(appIdentifier);

        //fail if no metadataContext received
        timeout = await window.setTimeout(() => {
          wrapper.reject("did not receive MetadataContext from metadata app");
        }, constants.WaitTime);

        //wait for raised intent
        await wrapper.promise;
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
    const { promise: sleepPromise, timeout: theTimeout } = sleep();
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

export interface MetadataContext extends Context {
  implMetadata?: ImplementationMetadata;
  contextMetadata?: ContextMetadata;
}

export interface MetadataAppCommandContext extends Context {
  command: string;
}

export enum MetadataAppCommand {
  sendGetInfoMetadataToTests = "sendGetInfoMetadataToTests",
  confirmRaisedIntentReceived = "confirmRaisedIntentReceived",
}
