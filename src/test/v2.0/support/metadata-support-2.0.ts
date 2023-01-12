import { assert, expect } from "chai";
import { IntentResolution, AppIdentifier, AppMetadata, Channel, Context, ContextMetadata, DesktopAgent, ImplementationMetadata } from "fdc3_2_0";
import constants from "../../../constants";
import { APIDocumentation2_0 } from "../apiDocuments-2.0";

const getMetadataDocs = "\r\nDocumentation: " + APIDocumentation2_0.appMetadata + "\r\nCause: ";
const getInfoDocs = "\r\nDocumentation: " + APIDocumentation2_0.getInfo + "\r\nCause";
declare let fdc3: DesktopAgent;

export class MetadataValidator {
  validateAppMetadata(metadata: AppMetadata) {
    expect(metadata, `The AppMetadata object does not contain an appId property${getMetadataDocs}`).to.have.property("appId");
    expect(typeof metadata.name, `Incorrect type detected for AppMetadata.name. Expected a string, got ${typeof metadata.name}`).to.be.equal("string");

    expect(metadata, `The AppMetadata object does not contain a name property${getMetadataDocs}`).to.have.property("name");
    expect(typeof metadata.name, `Incorrect type detected for AppMetadata.name. Expected a string, got ${typeof metadata.name}`).to.be.equal("string");

    expect(metadata, `The AppMetadata object does not contain a version property${getMetadataDocs}`).to.have.property("version");
    expect(typeof metadata.name, `Incorrect type detected for AppMetadata.name. Expected a string, got ${typeof metadata.name}`).to.be.equal("string");

    expect(metadata, `The AppMetadata object does not contain a title property${getMetadataDocs}`).to.have.property("title");
    expect(typeof metadata.title, `Incorrect type detected for AppMetadata.title. Expected a string, got ${typeof metadata.title}`).to.be.equal("string");

    expect(metadata, `The AppMetadata object does not contain a tooltip property${getMetadataDocs}`).to.have.property("tooltip");
    expect(typeof metadata.tooltip, `Incorrect type detected for AppMetadata.tooltip. Expected a string, got ${typeof metadata.tooltip}`).to.be.equal("string");

    expect(metadata, `The AppMetadata object does not contain a description property${getMetadataDocs}`).to.have.property("description");
    expect(typeof metadata.description, `Incorrect type detected for AppMetadata.description. Expected a string, got ${typeof metadata.description}`).to.be.equal("string");

    expect(metadata, `The AppMetadata object does not contain an icons property${getMetadataDocs}`).to.have.property("icons");
    if (!Array.isArray(metadata.icons)) {
      assert.fail(`Incorrect type detected for AppMetadata.icons. Expected an Array, got ${typeof metadata.description}`);
    }

    const isObjectArray = isArrayOfObjects(metadata.icons); // ensure icons property contains an array of objects
    if (!isObjectArray) assert.fail("AppMetadata.icons should contain an Array of objects");

    expect(metadata, getMetadataDocs).to.have.property("screenshots");
    if (!Array.isArray(metadata.screenshots)) {
      assert.fail(`Incorrect type detected for AppMetadata.icons. Expected an Array, got ${typeof metadata.description}`);
    }

    const isObjectArray2 = isArrayOfObjects(metadata.screenshots); // ensure screenshots property contains an array of objects
    if (!isObjectArray2) assert.fail("AppMetadata.screenshots should contain an Array of objects");

    expect(metadata, `The AppMetadata object does not contain nested property interop.intents.listensFor${getMetadataDocs}`).to.deep.nested.property("interop.intents.listensFor");
  }

  validateImplementationMetadata(implMetadata: ImplementationMetadata) {
    expect(implMetadata, `ImplementationMetadata did not have property fdc3Version${getInfoDocs}`).to.have.property("fdc3Version");
    expect(parseFloat(implMetadata.fdc3Version)).to.be.greaterThanOrEqual(2);
    expect(implMetadata, `ImplementationMetadata did not have property provider${getInfoDocs}`).to.have.property("provider");
    expect(implMetadata.provider).to.not.be.equal("");
    expect(implMetadata.optionalFeatures, `ImplementationMetadata.optionalFeatures did not have property OriginatingAppMetadata${getInfoDocs}`).to.have.property("OriginatingAppMetadata");
    expect(implMetadata.optionalFeatures, `ImplementationMetadata.optionalFeatures did not have property UserChannelMembershipAPIs${getInfoDocs}`).to.have.property("UserChannelMembershipAPIs");
    expect(typeof implMetadata.optionalFeatures.OriginatingAppMetadata, `ImplementationMetadata.optionalFeatures.OriginatingAppMetadata should be of type boolean`).to.be.equal("boolean");
    expect(typeof implMetadata.optionalFeatures.UserChannelMembershipAPIs, "ImplementationMetadata.optionalFeatures.UserChannelMembershipAPIs should be of type boolean").to.be.equal("boolean");
  }

  validateAppIdentifier(appIdentifier: AppIdentifier) {
    expect(appIdentifier, `AppIdentifier did not have property appId${getInfoDocs}`).to.have.property("appId");
    expect(typeof appIdentifier.appId).to.be.equal("string");
    expect(appIdentifier, `AppIdentifier did not have property instanceId${getInfoDocs}`).to.have.property("instanceId");
    expect(typeof appIdentifier.instanceId).to.be.equal("string");
  }
}

export class MetadataFdc3Api {
  async openMetadataApp(contextType?: string): Promise<AppIdentifier> {
    if (contextType) {
      return await fdc3.open(
        {
          appId: "MetadataAppId",
        },
        { type: contextType }
      );
    } else {
      return await fdc3.open({
        appId: "MetadataAppId",
      });
    }
  }

  async getAppInstances(): Promise<AppIdentifier[]> {
    return await fdc3.findInstances({ appId: "MetadataAppId" });
  }

  async getAppMetadata(appIdentifier?: AppIdentifier): Promise<AppMetadata> {
    if (!appIdentifier) {
      appIdentifier = {
        appId: "MetadataAppId",
      };
    }

    return await fdc3.getAppMetadata(appIdentifier);
  }

  async retrieveAppControlChannel(): Promise<Channel> {
    return await fdc3.getOrCreateChannel(constants.ControlChannel);
  }

  async raiseIntent(intent: string, contextType: string, appIdentifier: AppIdentifier): Promise<IntentResolution> {
    return await fdc3.raiseIntent(intent, { type: contextType }, appIdentifier);
  }

  async getInfo(): Promise<ImplementationMetadata> {
    return await fdc3.getInfo();
  }
}

const isArrayOfObjects = (array): boolean => {
  return (
    array.length > 0 &&
    array.every((value) => {
      return typeof value === "object";
    })
  );
};

export interface MetadataContext extends Context {
  implMetadata?: ImplementationMetadata;
  contextMetadata?: ContextMetadata;
}
