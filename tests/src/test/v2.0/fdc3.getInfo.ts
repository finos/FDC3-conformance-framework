import { assert, expect } from "chai";
import APIDocumentation from "../../apiDocuments";
import { DesktopAgent } from "../../../../node_modules/fdc3_2_0/dist/api/DesktopAgent";
import { Context } from "fdc3_2_0";
import constants from "../../constants";

const getInfoDocs =
  "\r\nDocumentation: " + APIDocumentation.getInfo2_0 + "\r\nCause";
const getMetadataDocs =
  "\r\nDocumentation: " + APIDocumentation.appMetadata + "\r\nCause";
let timeout: number;

export default () =>
  describe("fdc3.getInfo", () => {
    it("Method is callable", async () => {
      try {
        await (<DesktopAgent>(<unknown>window.fdc3)).getInfo();
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
        (<DesktopAgent>(<unknown>window.fdc3))
          .getInfo()
          .then((implMetadata) => {
            expect(implMetadata, getInfoDocs).to.have.property("fdc3Version");
            expect(Number(implMetadata.fdc3Version)).to.be.greaterThanOrEqual(
              2
            );
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
      const appIdentifier = await (<DesktopAgent>(<unknown>window.fdc3)).open({
        appId: "MockApp",
      });
      expect(appIdentifier).to.have.property("appId");
      expect(appIdentifier).to.have.property("instanceId");

      (<DesktopAgent>(<unknown>window.fdc3))
        .getInfo()
        .then(async (implMetadata) => {
          expect(implMetadata, getInfoDocs).to.have.property("appMetadata");
          expect(implMetadata.appMetadata, getInfoDocs).to.have.property(
            "appId"
          );
          expect(implMetadata.appMetadata, getInfoDocs).to.have.property(
            "instanceId"
          );
          expect(implMetadata.appMetadata.appId).to.be.equal(
            appIdentifier.appId
          );
          expect(implMetadata.appMetadata.instanceId).to.be.equal(
            appIdentifier.instanceId
          );

          //validate metadata properties
          expect(implMetadata.appMetadata, getInfoDocs).to.have.property(
            "name"
          );
          expect(implMetadata.appMetadata, getInfoDocs).to.have.property(
            "version"
          );
          expect(implMetadata.appMetadata.version, getInfoDocs).to.be.equal(
            "1.0.0"
          );
          expect(implMetadata.appMetadata, getInfoDocs).to.have.property(
            "title"
          );
          expect(implMetadata.appMetadata.title, getInfoDocs).to.be.equal(
            "A generic app directory record example"
          );
          expect(implMetadata.appMetadata, getInfoDocs).to.have.property(
            "tooltip"
          );
          expect(implMetadata.appMetadata.tooltip, getInfoDocs).to.be.equal(
            "tooltip"
          );
          expect(implMetadata.appMetadata, getInfoDocs).to.have.property(
            "description"
          );
          expect(implMetadata.appMetadata.description, getInfoDocs).to.be.equal(
            "Mock app used for testing. WARNING: changing this app's property definitions will cause metadata tests to fail"
          );
          expect(implMetadata.appMetadata, getInfoDocs).to.have.property(
            "icons"
          );
          expect(
            JSON.stringify(implMetadata.appMetadata.icons),
            getInfoDocs
          ).to.be.equal("[{ \"src\": \"http://localhost:3000/pathToIcon.png\" }]");
          expect(implMetadata.appMetadata, getInfoDocs).to.have.property(
            "images"
          );
          expect(
            JSON.stringify(implMetadata.appMetadata.images),
            getInfoDocs
          ).to.be.equal("[{ \"src\": \"http://localhost:3000/pathToImage.png\" }]");
          expect(implMetadata.appMetadata, getInfoDocs).to.have.property(
            "instanceId"
          );

          await broadcastCloseWindow();
          await waitForMockAppToClose();
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
  });
