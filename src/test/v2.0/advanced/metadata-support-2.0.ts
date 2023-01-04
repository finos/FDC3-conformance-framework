import { assert, expect } from "chai";
import { AppMetadata, Context, ContextMetadata, DesktopAgent, ImplementationMetadata } from "fdc3_2_0";
import { APIDocumentation2_0 } from "../apiDocuments-2.0";

declare let fdc3: DesktopAgent;
const getMetadataDocs = "\r\nDocumentation: " + APIDocumentation2_0.appMetadata + "\r\nCause: ";
const getInfoDocs = "\r\nDocumentation: " + APIDocumentation2_0.getInfo + "\r\nCause";

export function validateAppMetadata(metadata: AppMetadata) {
  expect(metadata, `no name property found on AppMetadata object${getMetadataDocs}`).to.have.property("name");
  if (typeof metadata.name !== "string") {
    assert.fail(`Incorrect type detected for AppMetadata.name. Expected a string, got ${typeof metadata.name}`);
  }
  expect(metadata, `no version property found on AppMetadata object${getMetadataDocs}`).to.have.property("version");
  expect(typeof metadata.version, `Incorrect type detected for AppMetadata.version. Expected a string, got ${typeof metadata.version}`).to.be.equal("string");

  expect(metadata, `no title property found on AppMetadata object${getMetadataDocs}`).to.have.property("title");
  expect(typeof metadata.title, `Incorrect type detected for AppMetadata.title. Expected a string, got ${typeof metadata.title}`).to.be.equal("string");

  expect(metadata, `no tooltip property found on AppMetadata object${getMetadataDocs}`).to.have.property("tooltip");
  expect(typeof metadata.tooltip, `Incorrect type detected for AppMetadata.tooltip. Expected a string, got ${typeof metadata.tooltip}`).to.be.equal("string");

  expect(metadata, `no description property found on AppMetadata object${getMetadataDocs}`).to.have.property("description");
  expect(typeof metadata.description, `Incorrect type detected for AppMetadata.description. Expected a string, got ${typeof metadata.description}`).to.be.equal("string");

  expect(metadata, `no icons property found on AppMetadata object${getMetadataDocs}`).to.have.property("icons");

  if (!Array.isArray(metadata.icons)) {
    assert.fail(`Incorrect type detected for AppMetadata.icons. Expected an Array, got ${typeof metadata.description}`);
  }

  //ensure icons property contains an array of objects
  const isObjectArray = isArrayOfObjects(metadata.icons);

  if (!isObjectArray) assert.fail("AppMetadata.icons should contain an Array of objects");

  expect(metadata, getMetadataDocs).to.have.property("screenshots");
  expect(typeof metadata.screenshots, `Incorrect type detected for AppMetadata.screenshots. Expected an Array, got ${typeof metadata.description}`).to.be.equal("Array");

  //ensure screenshots property contains an array of objects
  const isObjectArray2 = isArrayOfObjects(metadata.screenshots);

  if (!isObjectArray2) assert.fail("AppMetadata.screenshots should contain an Array of objects");
}

export function validateImplementationMetadata(implMetadata: ImplementationMetadata) {
  expect(implMetadata, `ImplementationMetadata did not have property fdc3Version${getInfoDocs}`).to.have.property("fdc3Version");
  expect(parseFloat(implMetadata.fdc3Version)).to.be.greaterThanOrEqual(2);
  expect(implMetadata, `ImplementationMetadata did not have property provider${getInfoDocs}`).to.have.property("provider");
  expect(implMetadata.provider).to.not.be.equal("");
  expect(implMetadata.optionalFeatures, `ImplementationMetadata.optionalFeatures did not have property OriginatingAppMetadata${getInfoDocs}`).to.have.property("OriginatingAppMetadata");
  expect(implMetadata.optionalFeatures, `ImplementationMetadata.optionalFeatures did not have property UserChannelMembershipAPIs${getInfoDocs}`).to.have.property("UserChannelMembershipAPIs");
  expect(typeof implMetadata.optionalFeatures.OriginatingAppMetadata, `ImplementationMetadata.optionalFeatures.OriginatingAppMetadata should be of type boolean`).to.be.equal("boolean");
  expect(typeof implMetadata.optionalFeatures.UserChannelMembershipAPIs, "ImplementationMetadata.optionalFeatures.UserChannelMembershipAPIs should be of type boolean").to.be.equal("boolean");
}

const isArrayOfObjects = (array): boolean => {
  return (
    array.length > 0 &&
    array.screenshots.every((value) => {
      return typeof value === "object";
    })
  );
};

export interface MetadataContext extends Context {
  implMetadata?: ImplementationMetadata;
  contextMetadata?: ContextMetadata;
}

export interface MetadataAppCommandContext extends Context {
  command: string;
}

export enum MetadataAppCommand {
  sendGetInfoMetadataToTests = "sendGetInfoMetadataToTests",
  confirmRaisedIntentReceived = "confirmRaisedIntentReceived",
}
