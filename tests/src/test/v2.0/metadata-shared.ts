import { Context, ContextMetadata, ImplementationMetadata } from "fdc3_2_0";

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