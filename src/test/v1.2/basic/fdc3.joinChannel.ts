import { expect } from "chai";
import { ChannelError } from "fdc3_1_2";
import { DesktopAgent } from "fdc3_1_2/dist/api/DesktopAgent";
import APIDocumentation from "../../../apiDocuments";

const joinChannelDocs =
  "\r\nDocumentation: " + APIDocumentation.joinChannel + "\r\nCause: ";

declare const fdc3: DesktopAgent;

function wrapPromise(): {
  promise: Promise<void>;
  resolve: (reason?: any) => void;
  reject: (reason?: any) => void;
} {
  let wrapperResolve;
  let wrapperReject;

  const promise = new Promise<void>((resolve, reject) => {
    wrapperResolve = resolve;
    wrapperReject = reject;
  });

  return { promise, resolve: wrapperResolve, reject: wrapperReject };
}

export default () =>
  describe("fdc3.joinChannel", () => {
    afterEach(async () => {
      await fdc3.leaveCurrentChannel();
    });

    it("(BasicJC1) Can join channel", async () => {
      const channels = await fdc3.getSystemChannels();

      await fdc3.joinChannel(channels[0].id);

      const current = await fdc3.getCurrentChannel();

      expect(current).to.not.be.null;
    });

    it("(BasicJC2) Can join the correct system channel", async () => {
      const [channel] = await fdc3.getSystemChannels();

      await fdc3.joinChannel(channel.id);

      const current = await fdc3.getCurrentChannel();

      expect(current).to.eql(channel);
    });

    it("(BasicJC3) Receive NoChannelFound error when joining a non-existing channel", async () => {
      const errorWrapper = wrapPromise();

      try {
        await fdc3.joinChannel("invalid-channel-name");
        errorWrapper.reject("Should have rejected - there's no such channel");
      } catch (error) {
        errorWrapper.resolve(error);
      }

      const err = await errorWrapper.promise;

      expect(err).to.have.property(
        "message",
        ChannelError.NoChannelFound,
        joinChannelDocs
      );
    });
  });
