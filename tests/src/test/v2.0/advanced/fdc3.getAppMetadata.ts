import { assert, expect } from "chai";
import APIDocumentation from "../../../apiDocuments";
import { DesktopAgent } from "fdc3_2_0/dist/api/DesktopAgent";
import { Context } from "fdc3_2_0";
import constants from "../../../constants";
import { sleep } from "../../../utils";

const fdc3 = <DesktopAgent>(<unknown>window.fdc3);

const getMetadataDocs =
  "\r\nDocumentation: " + APIDocumentation.appMetadata + "\r\nCause";

export default () =>
  describe("fdc3.getAppMetadata", () => {
    it("Method is callable", async () => {
      try {
        await fdc3.getAppMetadata({
          appId: "MockAppId",
        });
      } catch (ex) {
        assert.fail(getMetadataDocs + (ex.message ?? ex));
      }
    });

    it("(getAppMetadata (no instance)) Valid metadata object", async () => {
      try {
        //retrieve AppMetadata object
        const metadata = await fdc3.getAppMetadata({ appId: "MockAppId" });

        validateAppMetadata(metadata);
      } catch (ex) {
        assert.fail(getMetadataDocs + (ex.message ?? ex));
      }
    });

    it("(getAppMetadata (for instances)) App instance metadata is valid", async () => {
      try {
        const appIdentifier1 = await fdc3.open({ appId: "MockAppId" });
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

        const appIdentifier2 = await fdc3.open({ appId: "MockAppId" });
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

        const metadata1 = await fdc3.getAppMetadata(appIdentifier1);

        validateAppMetadata(metadata1);

        //check that metadata instanceId is the same as the appIdentifyer instanceId
        expect(
          metadata1.instanceId,
          "The AppMetaData's instanceId property that was retrieved when calling open() does not match AppIdentifier's instanceId property that was retrieved when calling getAppMetadata() for the same app instance"
        ).to.be.equal(appIdentifier1.instanceId);

        const metadata2 = await fdc3.getAppMetadata(appIdentifier2);

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
  let timeout;
  const messageReceived = new Promise<Context>(async (resolve, reject) => {
    const appControlChannel = await fdc3.getOrCreateChannel("app-control");
    const listener = await appControlChannel.addContextListener(
      "windowClosed",
      (context) => {
        resolve(context);
        clearTimeout(timeout);
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

export function validateAppMetadata(metadata) {
  expect(metadata, getMetadataDocs).to.not.have.property("instanceId");
  expect(metadata, getMetadataDocs).to.have.property("name");
  if (typeof metadata.name !== "string") {
    assert.fail(
      `Incorrect type detected for AppMetadata.name. Expected a string, got ${typeof metadata.name}`
    );
  }
  expect(metadata, getMetadataDocs).to.have.property("version");
  if (typeof metadata.version !== "string") {
    assert.fail(
      `Incorrect type detected for AppMetadata.version. Expected a string, got ${typeof metadata.version}`
    );
  }
  expect(metadata, getMetadataDocs).to.have.property("title");
  if (typeof metadata.title !== "string") {
    assert.fail(
      `Incorrect type detected for AppMetadata.title. Expected a string, got ${typeof metadata.title}`
    );
  }
  expect(metadata, getMetadataDocs).to.have.property("tooltip");
  if (typeof metadata.tooltip !== "string") {
    assert.fail(
      `Incorrect type detected for AppMetadata.tooltip. Expected a string, got ${typeof metadata.tooltip}`
    );
  }
  expect(metadata, getMetadataDocs).to.have.property("description");
  if (typeof metadata.description !== "string") {
    assert.fail(
      `Incorrect type detected for AppMetadata.description. Expected a string, got ${typeof metadata.description}`
    );
  }
  expect(metadata, getMetadataDocs).to.have.property("icons");

  //ensure icons property contains an array of objects
  if (!Array.isArray(metadata.icons)) {
    assert.fail(
      `Incorrect type detected for AppMetadata.icons. Expected an Array, got ${typeof metadata.description}`
    );
  } else {
    const isObjectArray =
      metadata.icons.length > 0 &&
      metadata.icons.every((value) => {
        return typeof value === "object";
      });

    if (!isObjectArray)
      assert.fail("AppMetadata.icons should contain an Array of objects");
  }

  expect(metadata, getMetadataDocs).to.have.property("images");

  //ensure images property contains an array of objects
  if (!Array.isArray(metadata.images)) {
    assert.fail(
      `Incorrect type detected for AppMetadata.images. Expected an Array, got ${typeof metadata.description}`
    );
  } else {
    const isObjectArray =
      metadata.images.length > 0 &&
      metadata.images.every((value) => {
        return typeof value === "object";
      });

    if (!isObjectArray)
      assert.fail("AppMetadata.images should contain an Array of objects");
  }
  expect(metadata, getMetadataDocs).to.have.property("interop");
}

const broadcastCloseWindow = async () => {
  const appControlChannel = await fdc3.getOrCreateChannel("app-control");
  await appControlChannel.broadcast({ type: "closeWindow" });
};

