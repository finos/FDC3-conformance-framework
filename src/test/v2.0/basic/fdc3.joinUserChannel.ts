import { assert, expect } from "chai";
import { DesktopAgent } from "fdc3_2_0/dist/api/DesktopAgent";

declare let fdc3: DesktopAgent;

function wrapPromise(): {
  promise: Promise<void>;
  resolve: () => void;
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

export default () => {}
  // describe("fdc3.joinChannel", () => {
  //   it("(BasicJC1) getCurrentChannel should retrieve 'null' or a channel object depending upon whether the channel has been joined or not", async () => {
  //     const channels = await fdc3.getUserChannels();
  //     if (channels.length > 0) {
  //       try {
  //         await fdc3.joinUserChannel(channels[0].id);
  //         const currentChannel = await fdc3.getCurrentChannel();
  //         if(typeof currentChannel !== "object") {
  //           assert.fail("getCurrentChannel did not retrieve a channel object");
  //         }
  //         expect(currentChannel.id).to.eql(channels[0].id);

  //         await fdc3.leaveCurrentChannel();
  //         const currentChannelAfterLeave = await fdc3.getCurrentChannel();
  //         expect(currentChannelAfterLeave).to.be.null;

  //       } catch (ex) {
  //         assert.fail("Error while joining channel: " + (ex.message ?? ex));
  //       }
  //     } else {
  //       assert.fail("No system channels available");
  //     }
  //   });
  // });
