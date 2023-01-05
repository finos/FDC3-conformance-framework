import { assert, expect } from "chai";
import { APIDocumentation2_0 } from "../../v2.0/apiDocuments-2.0";
import { DesktopAgent } from "fdc3_2_0/dist/api/DesktopAgent";
import { AppIdentifier, Context, ContextMetadata, ImplementationMetadata, IntentResolution } from "fdc3_2_0";
import constants from "../../../constants";
import { failOnTimeout, sleep, wait, wrapPromise } from "../../../utils";
import { closeMockAppWindow } from "../utils_2_0";
import { AppControlContext } from "../../../common-types";

declare let fdc3: DesktopAgent;
const findInstancesDocs = "\r\nDocumentation: " + APIDocumentation2_0.findInstances + "\r\nCause: ";

export default () =>
  describe("fdc3.findInstances", () => {
    after(async () => {
      await closeMockAppWindow();
    });

    it("(2.0-FindInstances) valid metadata when opening multiple instances of the same app", async () => {
      try {
        const appIdentifier = await openMetadataApp(); // open metadataApp
        const appIdentifier2 = await openMetadataApp(); // open second instance of metadataApp

        //confirm that the instanceId for both app instantiations is different
        expect(appIdentifier.instanceId, `The AppIdentifier's instanceId property for both instances of the opened app should not be the same.${findInstancesDocs}`).to.not.equal(appIdentifier2.instanceId);

        let instances = await fdc3.findInstances({ appId: "MetadataAppId" }); //retrieve instance details
        validateInstances(instances, appIdentifier, appIdentifier2);

        let timeout;
        const wrapper = wrapPromise();
        const appControlChannel = await fdc3.getOrCreateChannel(constants.ControlChannel);

        //ensure appIdentifier received the raised intent
        await appControlChannel.addContextListener("intent-listener-triggered", (context: AppControlContext) => {
          expect(context.instanceId, "the raised intent was received by a different instance of the mock app than expected").to.be.equals(appIdentifier.instanceId);
          clearTimeout(timeout);
          wrapper.resolve();
        });

        const resolution = await fdc3.raiseIntent("aTestingIntent", { type: "testContextX" }, appIdentifier); // raise an intent and target appIdentifier
        validateResolutionSource(resolution, appIdentifier);

        failOnTimeout("'intent-listener-triggered' context not received from mock app"); // fail if expected context not received
        await wrapper.promise; // wait for context from MetadataApp
      } catch (ex) {
        assert.fail(findInstancesDocs + (ex.message ?? ex));
      }
    });
  });

function validateResolutionSource(resolution: IntentResolution, appIdentifier: AppIdentifier) {
  // check that resolution.source matches the appIdentifier
  expect(resolution.source.appId, "IntentResolution.source.appId did not match the mock app's AppIdentifier's appId").to.be.equal(appIdentifier.appId);
  expect(resolution.source.instanceId, "IntentResolution.source.instanceId did not match the mock app's AppIdentifier's instanceId").to.be.equal(appIdentifier.instanceId);
}

function validateInstances(instances: AppIdentifier[], appIdentifier: AppIdentifier, appIdentifier2: AppIdentifier) {
  // check that the retrieved instances match the retrieved appIdentifiers
  if (!instances.some((instance) => JSON.stringify(instance) === JSON.stringify(appIdentifier) || JSON.stringify(instance) === JSON.stringify(appIdentifier2))) {
    assert.fail(`At least one AppIdentifier object is missing from the AppIdentifier array returned after calling fdc3.findInstances(app: AppIdentifier)${findInstancesDocs}`);
  }
}

async function openMetadataApp() {
  return await fdc3.open({
    appId: "MetadataAppId",
  });
}
