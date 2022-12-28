import { assert } from "chai";
import { wait } from "../../utils";
import {
  JOIN_AND_BROADCAST,
  JOIN_AND_BROADCAST_TWICE,
} from "./channel-control";
import { ChannelControl } from "./channel-control";

export function createUserChannelTests(
  cc: ChannelControl<any, any>,
  documentation: string,
  prefix: string
): Mocha.Suite {
  const channelName = prefix === "" ? "System channels" : "User channels";
  return describe(channelName, () => {
    beforeEach(cc.channelCleanUp);

    afterEach(async function afterEach() {
      await cc.closeChannelsAppWindow(this.currentTest.title);
      await cc.leaveChannel();
    });

    const scTestId6 =
      "(" +
      prefix +
      "UCFilteredContext3) Should not receive context when A & B join different user channels and app B broadcasts a listened type";
    it(scTestId6, async () => {
      const errorMessage = `\r\nSteps to reproduce:\r\n- App A adds fdc3.instrument and fdc3.contact context listener\r\n- App A joins channel 2\r\n- App B joins channel 1\r\n- App B broadcasts both context types${documentation}`;
      const testId = cc.getRandomId();
      await cc.setupAndValidateListener1(
        null,
        `fdc3.instrument_${testId}`,
        "unexpected-context",
        errorMessage,
        () => {
          /* noop */
        }
      );
      await cc.setupAndValidateListener2(
        null,
        `fdc3.instrument_${testId}`,
        "unexpected-context",
        errorMessage,
        () => {
          /* noop */
        }
      );

      const channels = await cc.getSystemChannels();
      if (channels.length < 1)
        assert.fail("No system channels available for app A");

      await cc.joinChannel(channels[0]);
      await cc.openChannelApp(
        scTestId6,
        channels[1].id,
        JOIN_AND_BROADCAST_TWICE,
        undefined,
        true,
        testId
      );
      await wait();
    });

    const scTestId7 =
    "(" +
    prefix +
    "UCUnsubscribe) Should not receive context when unsubscribing a user channel before app B broadcasts the listened type to that channel";
  it(scTestId7, async () => {
    const errorMessage = `\r\nSteps to reproduce:\r\n- App A adds context listener of type fdc3.instrument\r\n- App A joins channel 1\r\n- App A unsubscribes the listener\r\n- App B joins channel 1\r\n- App B broadcasts context of type fdc3.instrument${documentation}`;
    const testId = cc.getRandomId();
    const resolveExecutionCompleteListener =
      cc.initCompleteListener(scTestId7);
    await cc.setupAndValidateListener1(
      null,
      `fdc3.instrument_${testId}`,
      "unexpected-context",
      errorMessage,
      () => {
        /* noop */
      }
    );
    await cc.setupAndValidateListener2(
      null,
      `fdc3.contactTest_${testId}`,
      "unexpected-context",
      errorMessage,
      () => {
        /* noop */
      }
    );
    const channel = await cc.retrieveAndJoinChannel(5);
    await cc.unsubscribeListeners();
    await cc.openChannelApp(scTestId7, channel.id, JOIN_AND_BROADCAST, undefined, true, testId);
    await resolveExecutionCompleteListener;
  });

    const scTestId8 =
    "(" +
    prefix +
    "UCFilteredContext4) Should not receive context when joining two different user channels before app B broadcasts the listened type to the first channel that was joined";
  it(scTestId8, async () => {
    const errorMessage = `\r\nSteps to reproduce:\r\n- App A adds context listener of type fdc3.instrument\r\n- App A joins channel 1\r\n- App A joins channel 2\r\n- App B joins channel 1\r\n- App B broadcasts context of type fdc3.instrument${documentation}`;

    const contextId = cc.getRandomId();
    await cc.setupAndValidateListener1(
      null,
      `fdc3.instrument_${contextId}`,
      "unexpected-context",
      errorMessage,
      async () => {
        /* noop */
      }
    );
    await cc.setupAndValidateListener2(
      null,
      `fdc3.contact_${contextId}`,
      "unexpected-context",
      errorMessage,
      () => {
        /* noop */
      }
    );

    const channels = await cc.getSystemChannels();
    if (channels.length < 1) {
      assert.fail("No system channels available for app A");
    }

    await cc.joinChannel(channels[5]);
    await cc.joinChannel(channels[6]);
    await cc.openChannelApp(
      scTestId8,
      channels[5].id,
      JOIN_AND_BROADCAST,
      undefined,
      true,
      contextId
    );
    await wait(5000);
  });


  });
};
