import { assert, expect } from "chai";
import APIDocumentation from "../../../apiDocuments";
import { DesktopAgent } from "fdc3_2_0/dist/api/DesktopAgent";
import { Context } from "fdc3_2_0";
import constants from "../../../constants";
import { sleep, wrapPromise } from "../../../utils";
import { ImplementationMetadata } from "fdc3_2_0";
import { getOrCreateChannel } from "fdc3_2_0";
import { validateAppMetadata } from "./fdc3.getAppMetadata";
import {
  MetadataAppCommandContext,
  MetadataContext,
  MetadataAppCommand,
} from "./fdc3.findInstances";

declare let fdc3: DesktopAgent;
const getInfoDocs =
  "\r\nDocumentation: " + APIDocumentation.getInfo2_0 + "\r\nCause";
const getMetadataDocs =
  "\r\nDocumentation: " + APIDocumentation.appMetadata + "\r\nCause";

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
        assert.fail(
          "\r\nDocumentation: " +
            APIDocumentation.getInfo +
            "\r\nCause" +
            (ex.message ?? ex)
        );
      }
    });

    it("(2.0-GetInfo1) Returns a valid ImplementationMetadata object", async () => {
      try {
        const implMetadata = await fdc3.getInfo();
        expect(
          implMetadata,
          `ImplementationMetadata did not have property fdc3Version${getInfoDocs}`
        ).to.have.property("fdc3Version");
        expect(parseFloat(implMetadata.fdc3Version)).to.be.greaterThanOrEqual(
          2
        );
        expect(
          implMetadata,
          `ImplementationMetadata did not have property provider${getInfoDocs}`
        ).to.have.property("provider");
        expect(implMetadata.provider).to.not.be.equal("");
        expect(
          implMetadata.optionalFeatures,
          `ImplementationMetadata.optionalFeatures did not have property OriginatingAppMetadata${getInfoDocs}`
        ).to.have.property("OriginatingAppMetadata");
        expect(
          implMetadata.optionalFeatures,
          `ImplementationMetadata.optionalFeatures did not have property UserChannelMembershipAPIs${getInfoDocs}`
        ).to.have.property("UserChannelMembershipAPIs");
        expect(
          typeof implMetadata.optionalFeatures.OriginatingAppMetadata,
          `ImplementationMetadata.optionalFeatures.OriginatingAppMetadata should be of type boolean`
        ).to.be.equal("boolean");
        expect(
          typeof implMetadata.optionalFeatures.UserChannelMembershipAPIs,
          "ImplementationMetadata.optionalFeatures.UserChannelMembershipAPIs should be of type boolean"
        ).to.be.equal("boolean");
      } catch (ex) {
        assert.fail(getInfoDocs + (ex.message ?? ex));
      }
    });

    it("(2.0-GetInfo2) Returns a valid ImplementationMetadata object", async () => {
      console.log("startstart");
      let implMetadata: ImplementationMetadata;
      const appControlChannel = await getOrCreateChannel("app-control");

      //set command for metadata app
      const metadataAppContext: MetadataAppCommandContext = {
        type: "metadataAppContext",
        command: MetadataAppCommand.sendGetInfoMetadataToTests,
      };

      let timeout;
      const wrapper = wrapPromise();

      appControlChannel.addContextListener(
        "metadataContext",
        async (context: MetadataContext) => {
          implMetadata = context.implMetadata;
          wrapper.resolve();
          clearTimeout(timeout);
        }
      );

      const appIdentifier = await fdc3.open(
        { appId: "MetadataAppId" },
        metadataAppContext
      );

      //fail if no metadataContext received
      timeout = await window.setTimeout(() => {
        wrapper.reject("did not receive MetadataContext from metadata app");
      }, constants.WaitTime);

      //wait for listener to receive context
      await wrapper.promise;

      //validate AppIdentifier
      expect(
        appIdentifier,
        `AppIdentifier did not have property appId${getInfoDocs}`
      ).to.have.property("appId");
      expect(
        appIdentifier,
        `AppIdentifier did not have property instanceId${getInfoDocs}`
      ).to.have.property("instanceId");

      //validate ImplementationMetadata
      expect(
        implMetadata,
        `ImplementationMetadata did not have property appMetadata${getInfoDocs}`
      ).to.have.property("appMetadata");
      expect(
        implMetadata.appMetadata,
        `ImplementationMetadata did not have property appId${getInfoDocs}`
      ).to.have.property("appId");
      expect(
        implMetadata.appMetadata,
        `ImplementationMetadata did not have property instanceId${getInfoDocs}`
      ).to.have.property("instanceId");
      expect(
        implMetadata.appMetadata.appId,
        `ImplementationMetadata.appMetadata.appId did not match the ApplicationIdentifier.appId retrieved from the opened app`
      ).to.be.equal(appIdentifier.appId);
      expect(
        implMetadata.appMetadata.instanceId,
        `ImplementationMetadata.appMetadata.instanceId did not match the ApplicationIdentifier.instanceId retrieved from the opened app`
      ).to.be.equal(appIdentifier.instanceId);
      console.log("validating");

      //validate AppMetadata
      const metadata = await fdc3.getAppMetadata(appIdentifier);
      console.log(JSON.stringify(metadata));
      validateAppMetadata(metadata);
      console.log("vefore cleartimeout");
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
  });
