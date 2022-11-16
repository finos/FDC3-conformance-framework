import { assert, expect } from "chai";
import APIDocumentation from "../../../apiDocuments";
import { DesktopAgent } from "fdc3_2_0/dist/api/DesktopAgent";
import { Context } from "fdc3_2_0";
import constants from "../../../constants";
import { validateAppMetadata } from "../advanced/fdc3.getAppMetadata";
import { sleep } from "../../../utils";

const fdc3 = <DesktopAgent>(<unknown>window.fdc3);
const getInfoDocs =
  "\r\nDocumentation: " + APIDocumentation.getInfo2_0 + "\r\nCause";
const getMetadataDocs =
  "\r\nDocumentation: " + APIDocumentation.appMetadata + "\r\nCause";

export default () =>
  describe("fdc3.getInfo", () => {
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

    it("(DA metadata) Returns a valid ImplementationMetadata object ", async () => {
      try {
        fdc3.getInfo().then((implMetadata) => {
          expect(implMetadata, getInfoDocs).to.have.property("fdc3Version");
          expect(Number(implMetadata.fdc3Version)).to.be.greaterThanOrEqual(2);
          expect(implMetadata, getInfoDocs).to.have.property("provider");
          expect(implMetadata.provider).to.not.be.equal("");
          expect(implMetadata.optionalFeatures, getInfoDocs).to.have.property(
            "OriginatingAppMetadata"
          );
          expect(implMetadata.optionalFeatures, getInfoDocs).to.have.property(
            "UserChannelMembershipAPIs"
          );
          if (
            typeof implMetadata.optionalFeatures.OriginatingAppMetadata !==
            "boolean"
          ) {
            assert.fail(
              "ImplementationMetadata.optionalFeatures.OriginatingAppMetadata should be of type boolean"
            );
          } else if (
            typeof implMetadata.optionalFeatures.UserChannelMembershipAPIs !==
            "boolean"
          ) {
            assert.fail(
              "ImplementationMetadata.optionalFeatures.UserChannelMembershipAPIs should be of type boolean"
            );
          }
        });
      } catch (ex) {
        assert.fail(getInfoDocs + (ex.message ?? ex));
      }
    });

    it("(own AppMetadata) Returns a valid ImplementationMetadata object", async () => {
      const appIdentifier = await fdc3.open({
        appId: "MockApp",
      });
      expect(appIdentifier).to.have.property("appId");
      expect(appIdentifier).to.have.property("instanceId");

      fdc3.getInfo().then(async (implMetadata) => {
        expect(implMetadata, getInfoDocs).to.have.property("appMetadata");
        expect(implMetadata.appMetadata, getInfoDocs).to.have.property("appId");
        expect(implMetadata.appMetadata, getInfoDocs).to.have.property(
          "instanceId"
        );
        expect(implMetadata.appMetadata.appId).to.be.equal(appIdentifier.appId);
        expect(implMetadata.appMetadata.instanceId).to.be.equal(
          appIdentifier.instanceId
        );

        validateAppMetadata(implMetadata);

        await broadcastCloseWindow();
        await waitForMockAppToClose();
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

    const broadcastCloseWindow = async () => {
      const appControlChannel = await fdc3.getOrCreateChannel("app-control");
      await appControlChannel.broadcast({ type: "closeWindow" });
    };

  });
