import { assert, expect } from "chai";
import { DesktopAgent } from "fdc3_2_0/dist/api/DesktopAgent";
import { AppMetadata, Context } from "fdc3_2_0";
import { sleep } from "../../../utils";
import constants from "../../../constants";
import { APIDocumentation2_0 } from "../apiDocuments-2.0";
import { validateAppMetadata } from "./metadata-support-2.0";

declare let fdc3: DesktopAgent;
const getMetadataDocs = "\r\nDocumentation: " + APIDocumentation2_0.appMetadata + "\r\nCause: ";

export default () =>
  describe("fdc3.getAppMetadata", () => {
    after(async () => {
      await broadcastCloseWindow();
      await waitForMockAppToClose();
    });

    it("Method is callable", async () => {
      try {
        await fdc3.getAppMetadata({
          appId: "MetadataAppId",
        });
      } catch (ex) {
        assert.fail(getMetadataDocs + (ex.message ?? ex));
      }
    });

    it("(2.0-GetAppMetadata) Valid metadata object", async () => {
      try {
        //retrieve AppMetadata object
        const metadata = await fdc3.getAppMetadata({ appId: "MetadataAppId" });

        validateAppMetadata(metadata);
      } catch (ex) {
        assert.fail(getMetadataDocs + (ex.message ?? ex));
      }
    });

    it("(2.0-AppInstanceMetadata) App instance metadata is valid", async () => {
      try {
        //open metadata app
        const appIdentifier1 = await fdc3.open({ appId: "MetadataAppId" });
        expect(appIdentifier1, `The AppIdentifier object retrieved after calling fdc3.open() should contain an appId property.${getMetadataDocs}`).to.have.property("appId");
        expect(appIdentifier1, `The AppIdentifier object retrieved after calling fdc3.open() should contain an instanceId property.${getMetadataDocs}`).to.have.property("instanceId");

        if (typeof appIdentifier1.instanceId !== "string") {
          assert.fail("The instanceId property is not of type string");
        }

        //open metadata again
        const appIdentifier2 = await fdc3.open({ appId: "MetadataAppId" });
        expect(appIdentifier2, `The AppIdentifier object retrieved after calling fdc3.open() should contain an appId property.${getMetadataDocs}`).to.have.property("appId");
        expect(appIdentifier2, `The AppIdentifier object retrieved after calling fdc3.open() should contain an instanceId property.${getMetadataDocs}`).to.have.property("instanceId");

        expect(typeof appIdentifier2.instanceId, `The AppIdentifier.instanceId property should be of type string. Got ${typeof appIdentifier2.instanceId}`).to.be.equal("string");

        //check instanceId is different for both instantiations of the app
        expect(appIdentifier1.instanceId, `The AppIdentifier's instanceId property for both instances of the opened app should not be the same.${getMetadataDocs}`).to.not.equal(appIdentifier2.instanceId);

        const metadata1 = await fdc3.getAppMetadata(appIdentifier1);

        validateAppMetadata(metadata1);

        //check that metadata instanceId is the same as the appIdentifyer instanceId
        expect(
          metadata1.instanceId,
          "The AppMetaData's instanceId property that was retrieved when calling open() does not match AppIdentifier's instanceId property that was retrieved when calling getAppMetadata() for the same app instance"
        ).to.be.equal(appIdentifier1.instanceId);

        const metadata2 = await fdc3.getAppMetadata(appIdentifier2);

        expect(metadata2, `The AppIdentifier object retrieved after calling fdc3.open() should contain an instanceId property.${getMetadataDocs}`).to.have.property("instanceId");
        expect(metadata2.instanceId, "The AppMetaData's instanceId property retrieved when calling open() does not match AppIdentifier's instanceId property retrieved when calling getAppMetadata() for the same app").to.be.equal(
          appIdentifier2.instanceId
        );
      } catch (ex) {
        assert.fail(getMetadataDocs + (ex.message ?? ex));
      }
    });
  });

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

const broadcastCloseWindow = async () => {
  const appControlChannel = await fdc3.getOrCreateChannel(constants.ControlChannel);
  await appControlChannel.broadcast({ type: "closeWindow" });
};
