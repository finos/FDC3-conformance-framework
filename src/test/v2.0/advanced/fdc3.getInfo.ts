import { assert, expect } from "chai";
import { DesktopAgent } from "fdc3_2_0/dist/api/DesktopAgent";
import constants from "../../../constants";
import { failOnTimeout, wrapPromise } from "../../../utils";
import { closeMockAppWindow } from "../utils_2_0";
import { ImplementationMetadata } from "fdc3_2_0";
import { MetadataValidator, MetadataContext } from "./metadata-support-2.0";
import { APIDocumentation2_0 } from "../apiDocuments-2.0";

declare let fdc3: DesktopAgent;

const getInfoDocs = "\r\nDocumentation: " + APIDocumentation2_0.getInfo + "\r\nCause";
const validator = new MetadataValidator();

export default () =>
  describe("fdc3.getInfo", () => {
    after(async () => {
      await closeMockAppWindow();
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
        validator.validateImplementationMetadata(implMetadata);
      } catch (ex) {
        assert.fail(getInfoDocs + (ex.message ?? ex));
      }
    });

    it("(2.0-GetInfo2) Returns a valid ImplementationMetadata object", async () => {
      let implMetadata: ImplementationMetadata;
      const appControlChannel = await fdc3.getOrCreateChannel(constants.ControlChannel);

      let timeout;
      const wrapper = wrapPromise();

      appControlChannel.addContextListener("context-listener-triggered", async (context: MetadataContext) => {
        implMetadata = context.implMetadata;
        wrapper.resolve();
        clearTimeout(timeout);
      });

      const appIdentifier = await fdc3.open({ appId: "MetadataAppId" }, { type: "metadataAppContext" });
      validator.validateAppIdentifier(appIdentifier);
      timeout = failOnTimeout("did not receive MetadataContext from metadata app"); // fail if no metadataContext received
      await wrapper.promise; // wait for listener above to receive context

      // validate ImplementationMetadata
      expect(implMetadata, `ImplementationMetadata did not have property appMetadata${getInfoDocs}`).to.have.property("appMetadata");
      validator.validateAppIdentifier(implMetadata.appMetadata);

      // make sure appId and instanceId from the imlMetadata and appIdentifier objects match
      expect(implMetadata.appMetadata.appId, `ImplementationMetadata.appMetadata.appId did not match the ApplicationIdentifier.appId retrieved from the opened app`).to.be.equal(appIdentifier.appId);
      expect(implMetadata.appMetadata.instanceId, `ImplementationMetadata.appMetadata.instanceId did not match the ApplicationIdentifier.instanceId retrieved from the opened app`).to.be.equal(appIdentifier.instanceId);

      // validate AppMetadata
      const metadata = await fdc3.getAppMetadata(appIdentifier);
      validator.validateAppMetadata(metadata);
    });
  });
