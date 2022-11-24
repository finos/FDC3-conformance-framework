import { assert, expect } from "chai";
import APIDocumentation from "../../../apiDocuments";
import { sleep, wait } from "../../../utils";
import { channelCleanUp, closeChannelsAppWindow, getSystemChannels, getUserChannel, initCompleteListener, joinChannel, JOIN_AND_BROADCAST, JOIN_AND_BROADCAST_TWICE, leaveChannel, openChannelApp, retrieveAndJoinChannel, setupAndValidateListener1, setupAndValidateListener2, unsubscribeListeners } from "./channels-support";

const documentation =
  "\r\nDocumentation: " + APIDocumentation.desktopAgent + "\r\nCause:";

export default () =>
  describe("fdc3.broadcast", () => {
    describe("System channels", () => {
      beforeEach(channelCleanUp);

      afterEach(async function afterEach() {
        await closeChannelsAppWindow(this.currentTest.title);
      });

      const scTestId1 =
        "(UCBasicUsage1) Should receive context when adding a listener then joining a user channel before app B broadcasts context to the same channel";
      it(scTestId1, async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- Add fdc3.instrument context listener to app A\r\n- App A joins channel 1\r\n- App B joins channel 1\r\n- App B broadcasts fdc3.instrument context${documentation}`;

        const resolveExecutionCompleteListener = initCompleteListener(scTestId1)
        let receivedContext = false;
        setupAndValidateListener1(null, "fdc3.instrument", errorMessage, () => receivedContext = true);

        const channel = await retrieveAndJoinChannel(1);
        openChannelApp(scTestId1, channel.id, JOIN_AND_BROADCAST);

        await resolveExecutionCompleteListener;

        if (!receivedContext) {
          assert.fail("No context received" + errorMessage);
        }
      });

      const scTestId2 =
        "(UCBasicUsage2) Should receive context when joining a user channel then adding a context listener before app B broadcasts context to the same channel";
      it(scTestId2, async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- App A joins channel 1\r\n- Add listener of type fdc3.instrument to App A\r\n- App B joins channel 1\r\n- App B broadcasts fdc3.instrument context${documentation}`;

        const resolveExecutionCompleteListener = initCompleteListener(scTestId2)
        const channel = await retrieveAndJoinChannel(1);

        let receivedContext = false;
        setupAndValidateListener1(null, "fdc3.instrument", errorMessage, () => receivedContext = true);

        openChannelApp(scTestId2, channel.id, JOIN_AND_BROADCAST);

        //wait for ChannelsApp to execute
        await resolveExecutionCompleteListener;

        //Fail if no context received
        if (!receivedContext) {
          assert.fail(`No context received!\n${errorMessage}`);
        }
      });

      const scTestId3 =
        "(UCBasicUsage3) Should receive context when app B joins then broadcasts context to a user channel before A joins and listens on the same channel";
      it(scTestId3, async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- App B joins channel 1\r\n- App B broadcasts fdc3.instrument context\r\n- App A joins channel 1\r\n- App A adds fdc3.instrument context listener${documentation}`;

        //Listen for when ChannelsApp execution is complete
        const resolveExecutionCompleteListener = initCompleteListener(scTestId3)

        //retrieve a user channel to pass to channels app
        const channel = await getUserChannel(1);

        openChannelApp(scTestId3, channel.id, JOIN_AND_BROADCAST);

        //Join system channel 1
        await joinChannel(channel);

        let receivedContext = false;

        setupAndValidateListener1(null, "fdc3.instrument", errorMessage, () => receivedContext = true);


        //Wait for ChannelsApp to execute
        await resolveExecutionCompleteListener;

        //Fail if no context received
        if (!receivedContext) {
          assert.fail(`No context received!\n${errorMessage}`);
        }
      });

      const scTestId4 =
        "(UCFilteredContext1) Should receive context when app A joins a user channel before adding a listener and app B broadcasts the listened type to the same user channel";
      it(scTestId4, async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- App A adds fdc3.instrument context listener\r\n- App A joins channel 1\r\n- App B joins channel 1\r\n- App B broadcasts context of type fdc3.instrument${documentation}`;

        //Listen for when ChannelsApp execution is complete
        const resolveExecutionCompleteListener = initCompleteListener(scTestId4)
        let receivedContext = false;

        setupAndValidateListener1(null, "fdc3.instrument", errorMessage, () => receivedContext = true);

        //Join system channel 1
        const channel = await retrieveAndJoinChannel(1);

        openChannelApp(scTestId4, channel.id, JOIN_AND_BROADCAST);


        //Wait for ChannelsApp to execute
        await resolveExecutionCompleteListener;

        //Fail if no context received
        if (!receivedContext) {
          assert.fail(`No context received!\n${errorMessage}`);
        }
      });

      const scTestId5 =
        "(UCFilteredContext2) Should receive multiple contexts when app B broadcasts the listened types to the same user channel";
      it(scTestId5, async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- App A adds fdc3.instrument and fdc3.contact context listener\r\n- App A joins channel 1\r\n- App B joins channel 1\r\n- App B broadcasts both context types${documentation}`;

        //Listen for when ChannelsApp execution is complete
        const resolveExecutionCompleteListener = initCompleteListener(scTestId5)
        
        let contextTypes: string[] = [];
        let receivedContext = false;

        function checkIfBothContextsReceived() {
          if (contextTypes.length === 2) {
            if (
              !contextTypes.includes("fdc3.contact") ||
              !contextTypes.includes("fdc3.instrument")
            ) {
              assert.fail("Incorrect context received", errorMessage);
            } else {
              receivedContext = true;
            }
          }
        }

        setupAndValidateListener1(null, "fdc3.instrument", errorMessage, (context) => {
          contextTypes.push(context.type);
          checkIfBothContextsReceived();
        });

        setupAndValidateListener2(null, "fdc3.contact", errorMessage, (context) => {
          contextTypes.push(context.type);
          checkIfBothContextsReceived();
        });

        //Join system channel 1
        const channel = await retrieveAndJoinChannel(1);

        openChannelApp(scTestId5, channel.id, JOIN_AND_BROADCAST_TWICE);


        //Wait for ChannelsApp to execute
        await resolveExecutionCompleteListener;

        //Fail if no context received
        if (!receivedContext) {
          assert.fail(
            `At least one context was not received!\n${errorMessage}`
          );
        }
      });

      const scTestId6 =
        "(UCFilteredContext3) Should not receive context when A & B join different user channels and app B broadcasts a listened type";
      it(scTestId6, async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- App A adds fdc3.instrument and fdc3.contact context listener\r\n- App A joins channel 2\r\n- App B joins channel 1\r\n- App B broadcasts both context types${documentation}`;

        setupAndValidateListener1(null, "unexpected-context", errorMessage, () =>  {/* noop */});
        setupAndValidateListener2(null, "unexpected-context", errorMessage, () =>  {/* noop */});

        const channels = await getSystemChannels();
        if (channels.length < 1)
          assert.fail("No system channels available for app A");

        //Join a different channel to the one passed to channelsApp
        await joinChannel(channels[0]) ; 

        openChannelApp(scTestId6, channels[1].id, JOIN_AND_BROADCAST_TWICE);


        //Give listeners time to receive context
        await wait();
      });

      const scTestId7 =
        "(UCUnsubscribe) Should not receive context when unsubscribing a user channel before app B broadcasts the listened type to that channel";
      it(scTestId7, async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- App A adds context listener of type fdc3.instrument\r\n- App A joins channel 1\r\n- App A unsubscribes the listener\r\n- App B joins channel 1\r\n- App B broadcasts context of type fdc3.instrument${documentation}`;

        //Listen for when ChannelsApp execution is complete
        const resolveExecutionCompleteListener = initCompleteListener(scTestId7)

        setupAndValidateListener1(null, "unexpected-context", errorMessage, () =>  {/* noop */});

        //Join system channel 1
        const channel = await retrieveAndJoinChannel(1);

        unsubscribeListeners();
        openChannelApp(scTestId7, channel.id, JOIN_AND_BROADCAST);

        await resolveExecutionCompleteListener;
      });

      const scTestId8 =
        "(UCFilteredContext4) Should not receive context when joining two different user channels before app B broadcasts the listened type to the first channel that was joined";
      it(scTestId8, async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- App A adds context listener of type fdc3.instrument\r\n- App A joins channel 1\r\n- App A joins channel 2\r\n- App B joins channel 1\r\n- App B broadcasts context of type fdc3.instrument${documentation}`;

        setupAndValidateListener1(null, "unexpected-context", errorMessage, () =>  {/* noop */});

        const channels = await getSystemChannels(); 
        if (channels.length < 1) {
          assert.fail("No system channels available for app A");
        }

        //Join a channel before joining a different channel
        joinChannel(channels[0]);
        joinChannel(channels[1]);

        openChannelApp(scTestId8, channels[0].id, JOIN_AND_BROADCAST_TWICE);

        //Give listener time to receive context
        await wait();
      });

      const scTestId9 =
        "(UCFilteredContext5) Should not receive context when joining and then leaving a user channel before app B broadcasts the listened type to the same channel";
      it(scTestId9, async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- App A adds context listener of type fdc3.instrument\r\n- App A joins channel 1\r\n- App A leaves channel 1\r\n- App B joins channel 1\r\n- App B broadcasts context of type fdc3.instrument${documentation}`;

        setupAndValidateListener1(null, "unexpected-context", errorMessage, () =>  {/* noop */});

        //Join system channel 1
        const channel = await retrieveAndJoinChannel(1);

        //App A leaves channel 1
        await leaveChannel();

        openChannelApp(scTestId9, channel.id, JOIN_AND_BROADCAST)

        //Give listener time to receive context
        await wait();
      });
    });

  });