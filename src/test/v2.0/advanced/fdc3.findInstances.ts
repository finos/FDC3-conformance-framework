import { assert, expect } from "chai";
import { APIDocumentation2_0 } from "../../v2.0/apiDocuments-2.0";
import { failOnTimeout, wrapPromise } from "../../../utils";
import { closeMockAppWindow } from "../fdc3-2_0-utils";
import { AppControlContext } from "../../../context-types";
import { MetadataFdc3Api } from "./metadata-support-2.0";

const findInstancesDocs = "\r\nDocumentation: " + APIDocumentation2_0.findInstances + "\r\nCause: ";

export default () =>
  describe("fdc3.findInstances", () => {
    after(async function after() {
      await closeMockAppWindow(this.currentTest.title);
    });

    const findInstances = "(2.0-FindInstances) valid metadata when opening multiple instances of the same app";
    it(findInstances, async () => {
      const api = new MetadataFdc3Api();
      try {
        const appIdentifier = await api.openMetadataApp(); // open metadataApp
        const appIdentifier2 = await api.openMetadataApp(); // open second instance of metadataApp

        //confirm that the instanceId for both app instantiations is different
        expect(appIdentifier.instanceId, `The AppIdentifier's instanceId property for both instances of the opened app should not be the same.${findInstancesDocs}`).to.not.equal(appIdentifier2.instanceId);

        let instances = await api.getAppInstances();
        validateInstances(instances, appIdentifier, appIdentifier2);

        let timeout;
        const wrapper = wrapPromise();
        const appControlChannel = await api.retrieveAppControlChannel();

        //ensure appIdentifier received the raised intent
        await appControlChannel.addContextListener("intent-listener-triggered", (context: AppControlContext) => {
          expect(context.instanceId, "the raised intent was received by a different instance of the mock app than expected").to.be.equals(appIdentifier.instanceId);
          clearTimeout(timeout);
          wrapper.resolve();
        });

        const resolution = await api.raiseIntent("aTestingIntent", "testContextX", appIdentifier); // raise an intent that targets appIdentifier
        validateResolutionSource(resolution, appIdentifier);

        timeout = failOnTimeout("intent-listener-triggered' context not received from mock app"); // fail if expected context not received
        await wrapper.promise; // wait for context from MetadataApp
      } catch (ex) {
        assert.fail(findInstancesDocs + (ex.message ?? ex));
      }
    });
  });

function validateResolutionSource(resolution, appIdentifier) {
  // check that resolution.source matches the appIdentifier
  expect(resolution.source.appId, "IntentResolution.source.appId did not match the mock app's AppIdentifier's appId").to.be.equal(appIdentifier.appId);
  expect(resolution.source.instanceId, "IntentResolution.source.instanceId did not match the mock app's AppIdentifier's instanceId").to.be.equal(appIdentifier.instanceId);
}

function validateInstances(instances, appIdentifier, appIdentifier2) {
  // check that the retrieved instances match the retrieved appIdentifiers
  if (!instances.some((instance) => JSON.stringify(instance) === JSON.stringify(appIdentifier) || JSON.stringify(instance) === JSON.stringify(appIdentifier2))) {
    assert.fail(`At least one AppIdentifier object is missing from the AppIdentifier array returned after calling fdc3.findInstances(app: AppIdentifier)${findInstancesDocs}`);
  }
}
