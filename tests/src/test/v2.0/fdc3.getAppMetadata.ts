import { assert, expect } from "chai";
import APIDocumentation from "../../apiDocuments";
import { DesktopAgent } from "fdc3_2_0/dist/api/DesktopAgent";
import { Context } from "fdc3_2_0";
import constants from "../../constants";

const getMetadataDocs =
  "\r\nDocumentation: " + APIDocumentation.appMetadata + "\r\nCause";
let timeout: number;

export default () =>
  describe("fdc3.getAppMetadata", () => {
    it("Method is callable", async () => {
      try {
        await (<DesktopAgent>(<unknown>window.fdc3)).getAppMetadata({
          appId: "MockAppId",
        });
      } catch (ex) {
        assert.fail(getMetadataDocs + (ex.message ?? ex));
      }
    });

    it("(getAppMetadata (no instance)) Valid metadata object", async () => {
      try {
        //retrieve AppMetadata object
        const metadata = await (<DesktopAgent>(
          (<unknown>window.fdc3)
        )).getAppMetadata({ appId: "MockAppId" });

        //validate AppMetadata
        expect(metadata, getMetadataDocs).to.not.have.property("instanceId");
        expect(metadata, getMetadataDocs).to.have.property("name");
        expect(metadata.name, getMetadataDocs).to.be.equal("appMetadata");
        expect(metadata, getMetadataDocs).to.have.property("version");
        expect(metadata.version).to.be.equal("1.0.0");
        expect(metadata, getMetadataDocs).to.have.property("title");
        expect(metadata.title).to.be.equal(
          "A generic app directory record example"
        );
        expect(metadata, getMetadataDocs).to.have.property("tooltip");
        expect(metadata.tooltip).to.be.equal("tooltip");
        expect(metadata, getMetadataDocs).to.have.property("description");
        expect(metadata.description).to.be.equal(
          "Mock app used for testing. WARNING: changing this app's property definitions will cause metadata tests to fail"
        );
        expect(metadata, getMetadataDocs).to.have.property("icons");
        expect(JSON.stringify(metadata.icons)).to.be.equal(
          "[{ \"src\": \"http://localhost:3000/pathToIcon.png\" }]"
        );
        expect(metadata, getMetadataDocs).to.have.property("images");
        expect(JSON.stringify(metadata.images)).to.be.equal(
          "[{ \"src\": \"http://localhost:3000/pathToImage.png\" }]"
        );
      } catch (ex) {
        assert.fail(getMetadataDocs + (ex.message ?? ex));
      }
    });

    it("(getAppMetadata (for instances)) App instance metadata is valid", async () => {
      try {
        const appIdentifier1 = await (<DesktopAgent>(
          (<unknown>window.fdc3)
        )).open({ appId: "MockAppId" });
        expect(
          appIdentifier1,
          `The AppIdentifier object retrieved after calling fdc3.open() should contain an appId property.${getMetadataDocs}`
        ).to.have.property("appId");
        expect(
          appIdentifier1,
          `The AppIdentifier object retrieved after calling fdc3.open() should contain an instanceId property.${getMetadataDocs}`
        ).to.have.property("instanceId");

        if (typeof appIdentifier1.instanceId !== "string") {
          assert.fail("The instanceId property is not of type string");
        }

        const appIdentifier2 = await (<DesktopAgent>(
          (<unknown>window.fdc3)
        )).open({ appId: "MockAppId" });
        expect(
          appIdentifier2,
          `The AppIdentifier object retrieved after calling fdc3.open() should contain an appId property.${getMetadataDocs}`
        ).to.have.property("appId");
        expect(
          appIdentifier2,
          `The AppIdentifier object retrieved after calling fdc3.open() should contain an instanceId property.${getMetadataDocs}`
        ).to.have.property("instanceId");

        if (typeof appIdentifier2.instanceId !== "string") {
          assert.fail(
            "The instanceId property is not of type string",
            getMetadataDocs
          );
        }

        //check instanceId is different for both instantiations of the app
        expect(
          appIdentifier1.instanceId,
          `The AppIdentifier's instanceId property for both instances of the opened app should not be the same.${getMetadataDocs}`
        ).to.not.equal(appIdentifier2.instanceId);

        const metadata1 = await (<DesktopAgent>(
          (<unknown>window.fdc3)
        )).getAppMetadata(appIdentifier1);

        //validate metadata properties
        expect(metadata1, getMetadataDocs).to.not.have.property("instanceId");
        expect(metadata1, getMetadataDocs).to.have.property("name");
        expect(metadata1.name).to.be.equal("MockApp");
        expect(metadata1, getMetadataDocs).to.have.property("version");
        expect(metadata1.version).to.be.equal("1.0.0");
        expect(metadata1, getMetadataDocs).to.have.property("title");
        expect(metadata1.title).to.be.equal(
          "A generic app directory record example"
        );
        expect(metadata1, getMetadataDocs).to.have.property("tooltip");
        expect(metadata1.tooltip).to.be.equal("tooltip");
        expect(metadata1, getMetadataDocs).to.have.property("description");
        expect(metadata1.description).to.be.equal(
          "Mock app used for testing. WARNING: changing this app's property definitions will cause metadata tests to fail"
        );
        expect(metadata1, getMetadataDocs).to.have.property("icons");
        expect(JSON.stringify(metadata1.icons)).to.be.equal(
          "[{ \"src\": \"http://localhost:3000/pathToIcon.png\" }]"
        );
        expect(metadata1, getMetadataDocs).to.have.property("images");
        expect(JSON.stringify(metadata1.images)).to.be.equal(
          "[{ \"src\": \"http://localhost:3000/pathToImage.png\" }]"
        );
        expect(metadata1, getMetadataDocs).to.have.property("instanceId");

        //check that metadata instanceId is the same as the appIdentifyer instanceId
        expect(
          metadata1.instanceId,
          "The AppMetaData's instanceId property that was retrieved when calling open() does not match AppIdentifier's instanceId property that was retrieved when calling getAppMetadata() for the same app instance"
        ).to.be.equal(appIdentifier1.instanceId);

        const metadata2 = await (<DesktopAgent>(
          (<unknown>window.fdc3)
        )).getAppMetadata(appIdentifier2);

        expect(
          metadata2,
          `The AppIdentifier object retrieved after calling fdc3.open() should contain an instanceId property.${getMetadataDocs}`
        ).to.have.property("instanceId");
        expect(
          metadata2.instanceId,
          "The AppMetaData's instanceId property retrieved when calling open() does not match AppIdentifier's instanceId property retrieved when calling getAppMetadata() for the same app"
        ).to.be.equal(appIdentifier2.instanceId);

        await broadcastCloseWindow();
        await waitForMockAppToClose();
      } catch (ex) {
        assert.fail(getMetadataDocs + (ex.message ?? ex));
      }
    });
  });

async function waitForMockAppToClose() {
  const messageReceived = new Promise<Context>(async (resolve, reject) => {
    const appControlChannel = await (<DesktopAgent>(
      (<unknown>window.fdc3)
    )).getOrCreateChannel("app-control");
    const listener = await appControlChannel.addContextListener(
      "windowClosed",
      (context) => {
        resolve(context);
        clearTimeout(timeout);
        listener.unsubscribe();
      }
    );

    //if no context received reject promise
    await wait();
    reject(new Error("windowClosed context not received from app B"));
  });

  return messageReceived;
}

const broadcastCloseWindow = async () => {
  const appControlChannel = await (<DesktopAgent>(
    (<unknown>window.fdc3)
  )).getOrCreateChannel("app-control");
  await appControlChannel.broadcast({ type: "closeWindow" });
};

async function wait() {
  return new Promise((resolve) => {
    timeout = window.setTimeout(() => {
      resolve(true);
    }, constants.WaitTime);
  });
}
