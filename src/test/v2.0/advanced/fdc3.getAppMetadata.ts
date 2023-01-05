import { assert, expect } from "chai";
import { APIDocumentation2_0 } from "../apiDocuments-2.0";
import { MetadataFdc3Api, MetadataValidator } from "./metadata-support-2.0";
import { closeMockAppWindow } from "../utils_2_0";

const getMetadataDocs = "\r\nDocumentation: " + APIDocumentation2_0.appMetadata + "\r\nCause: ";
const validator = new MetadataValidator();
const api = new MetadataFdc3Api();

export default () =>
  describe("fdc3.getAppMetadata", () => {
    after(async () => {
      await closeMockAppWindow();
    });

    it("Method is callable", async () => {
      try {
        await api.getAppMetadata();
      } catch (ex) {
        assert.fail(getMetadataDocs + (ex.message ?? ex));
      }
    });

    it("(2.0-GetAppMetadata) Valid metadata object", async () => {
      try {
        //retrieve AppMetadata object
        const metadata = await api.getAppMetadata();

        validator.validateAppMetadata(metadata);
      } catch (ex) {
        assert.fail(getMetadataDocs + (ex.message ?? ex));
      }
    });

    it("(2.0-AppInstanceMetadata) App instance metadata is valid", async () => {
      try {
        //open metadata app
        const appIdentifier1 = await api.openMetadataApp();
        validator.validateAppIdentifier(appIdentifier1);

        //open metadata app again
        const appIdentifier2 = await api.openMetadataApp();
        validator.validateAppIdentifier(appIdentifier2);

        //check instanceId is different for both instantiations of the app
        expect(appIdentifier1.instanceId, `The AppIdentifier's instanceId property for both instances of the opened app should not be the same.${getMetadataDocs}`).to.not.equal(appIdentifier2.instanceId);

        const metadata1 = await api.getAppMetadata();
        validator.validateAppMetadata(metadata1);

        //check that metadata instanceId is the same as the appIdentifyer instanceId
        expect(
          metadata1.instanceId,
          "The AppMetaData's instanceId property that was retrieved when calling open() does not match AppIdentifier's instanceId property that was retrieved when calling getAppMetadata() for the same app instance"
        ).to.be.equal(appIdentifier1.instanceId);

        const metadata2 = await api.getAppMetadata();

        expect(metadata2, `The AppIdentifier object retrieved after calling fdc3.open() should contain an instanceId property.${getMetadataDocs}`).to.have.property("instanceId");
        expect(metadata2.instanceId, "The AppMetaData's instanceId property retrieved when calling open() does not match AppIdentifier's instanceId property retrieved when calling getAppMetadata() for the same app").to.be.equal(
          appIdentifier2.instanceId
        );
      } catch (ex) {
        assert.fail(getMetadataDocs + (ex.message ?? ex));
      }
    });
  });
