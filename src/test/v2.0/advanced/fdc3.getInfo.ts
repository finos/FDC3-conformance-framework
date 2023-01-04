import { assert, expect } from "chai";
import { DesktopAgent } from "fdc3_2_0/dist/api/DesktopAgent";
import { Context } from "fdc3_2_0";
import constants from "../../../constants";
import { sleep, wrapPromise } from "../../../utils";
import { ImplementationMetadata } from "fdc3_2_0";
import { validateAppMetadata, validateImplementationMetadata } from "./metadata-support-2.0";
import { MetadataAppCommandContext, MetadataContext, MetadataAppCommand } from "./metadata-support-2.0";
import { APIDocumentation2_0 } from "../apiDocuments-2.0";

declare let fdc3: DesktopAgent;
const getInfoDocs = "\r\nDocumentation: " + APIDocumentation2_0.getInfo + "\r\nCause";

export default () =>
  describe("fdc3.getInfo", () => {
    after(async () => {
      await broadcastCloseWindow();
      await waitForMockAppToClose();
    });

    it("Method is callable", async () => {
      try {
        await fdc3.getInfo();
      } catch (ex) {
        assert.fail("\r\nDocumentation: " + APIDocumentation2_0.getInfo + "\r\nCause" + (ex.message ?? ex));
      }
    });

    it("(2.0-GetInfo1) Returns a valid ImplementationMetadata object", async () => {
      try {
        const implMetadata = await fdc3.getInfo();
        validateImplementationMetadata(implMetadata);
      } catch (ex) {
        assert.fail(getInfoDocs + (ex.message ?? ex));
      }
    });

    it("(2.0-GetInfo2) Returns a valid ImplementationMetadata object", async () => {
      let implMetadata: ImplementationMetadata;
      const appControlChannel = await fdc3.getOrCreateChannel(constants.ControlChannel);

      //set command for metadata app
      const metadataAppContext: MetadataAppCommandContext = {
        type: "metadataAppContext",
        command: MetadataAppCommand.sendGetInfoMetadataToTests,
      };

      let timeout;
      const wrapper = wrapPromise();

      appControlChannel.addContextListener("metadataContext", async (context: MetadataContext) => {
        implMetadata = context.implMetadata;
        wrapper.resolve();
        clearTimeout(timeout);
      });

      const appIdentifier = await fdc3.open({ appId: "MetadataAppId" }, metadataAppContext);

      // fail if no metadataContext received
      timeout = window.setTimeout(() => {
        wrapper.reject("did not receive MetadataContext from metadata app");
      }, constants.WaitTime);

      await wrapper.promise; // wait for listener to receive context

      // validate AppIdentifier
      expect(appIdentifier, `AppIdentifier did not have property appId${getInfoDocs}`).to.have.property("appId");
      expect(appIdentifier, `AppIdentifier did not have property instanceId${getInfoDocs}`).to.have.property("instanceId");

      // validate ImplementationMetadata
      expect(implMetadata, `ImplementationMetadata did not have property appMetadata${getInfoDocs}`).to.have.property("appMetadata");
      expect(implMetadata.appMetadata, `ImplementationMetadata did not have property appId${getInfoDocs}`).to.have.property("appId");
      expect(implMetadata.appMetadata, `ImplementationMetadata did not have property instanceId${getInfoDocs}`).to.have.property("instanceId");
      expect(implMetadata.appMetadata.appId, `ImplementationMetadata.appMetadata.appId did not match the ApplicationIdentifier.appId retrieved from the opened app`).to.be.equal(appIdentifier.appId);
      expect(implMetadata.appMetadata.instanceId, `ImplementationMetadata.appMetadata.instanceId did not match the ApplicationIdentifier.instanceId retrieved from the opened app`).to.be.equal(appIdentifier.instanceId);

      // validate AppMetadata
      const metadata = await fdc3.getAppMetadata(appIdentifier);
      console.log(JSON.stringify(metadata));
      validateAppMetadata(metadata);
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
  });
