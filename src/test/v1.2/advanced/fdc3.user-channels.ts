import { Listener, Channel, Context, getCurrentChannel } from "fdc3_1_2";
import { assert, expect } from "chai";
import constants from "../../../constants";
import APIDocumentation from "../../../apiDocuments";
import { DesktopAgent } from "fdc3_1_2/dist/api/DesktopAgent";
import { sleep, wait } from "../../../utils";
import { buildChannelsAppContext, ChannelsAppConfig, closeChannelsAppWindow, commands, getUserChannel, initCompleteListener, JOIN_AND_BROADCAST, JOIN_AND_BROADCAST_TWICE, retrieveAndJoinChannel, unsubscribeListeners, validateListenerObject, waitForContext } from "./channels-support";

declare let fdc3: DesktopAgent;
const documentation =
  "\r\nDocumentation: " + APIDocumentation.desktopAgent + "\r\nCause:";

export default () =>
  describe("fdc3.broadcast", () => {
    let listener: Listener;
    let listener2: Listener;

    async function openChannelApp(testId: string, channelId: string, commands: string[]) {
      const channelsAppConfig: ChannelsAppConfig = {
        fdc3ApiVersion: "1.2",
        testId: testId,
        userChannelId: channelId,
        notifyAppAOnCompletion: true,
      };

      //Open ChannelsApp then execute commands in order
      await fdc3.open(
        "ChannelsApp",
        buildChannelsAppContext(commands, channelsAppConfig)
      );
    }

    it("Broadcast method is callable", async () => {
      fdc3.broadcast({
        type: "fdc3.instrument",
        id: { ticker: "AAPL" },
      });
    });

    describe("System channels", () => {
      beforeEach(async () => {
        await unsubscribeListeners(listener, listener2);
        await fdc3.leaveCurrentChannel();
      });

      afterEach(async function afterEach() {
        await closeChannelsAppWindow(this.currentTest.title);
      });

      const scTestId1 =
        "(UCBasicUsage1) Should receive context when adding a listener then joining a user channel before app B broadcasts context to the same channel";
      it(scTestId1, async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- Add fdc3.instrument context listener to app A\r\n- App A joins channel 1\r\n- App B joins channel 1\r\n- App B broadcasts fdc3.instrument context${documentation}`;

        //Listen for when ChannelsApp execution is complete
        const resolveExecutionCompleteListener = initCompleteListener(scTestId1)

        //Add context listener
        let receivedContext = false;
        listener = fdc3.addContextListener(null, async (context) => {
          expect(context.type).to.be.equals("fdc3.instrument", errorMessage);
          receivedContext = true;
        });

        validateListenerObject(listener);

        //Join system channel 1
        const channel = await retrieveAndJoinChannel(1);

        openChannelApp(scTestId1, channel.id, JOIN_AND_BROADCAST);

        //wait for ChannelsApp to execute
        await resolveExecutionCompleteListener;

        //reject if no context received
        if (!receivedContext) {
          assert.fail("No context received" + errorMessage);
        }
      });

      const scTestId2 =
        "(UCBasicUsage2) Should receive context when joining a user channel then adding a context listener before app B broadcasts context to the same channel";
      it(scTestId2, async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- App A joins channel 1\r\n- Add listener of type fdc3.instrument to App A\r\n- App B joins channel 1\r\n- App B broadcasts fdc3.instrument context${documentation}`;

        //Listen for when ChannelsApp execution is complete
        const resolveExecutionCompleteListener = initCompleteListener(scTestId2)

        //Join system channel 1
        const channel = await retrieveAndJoinChannel(1);

        let receivedContext = false;

        //Add fdc3.instrument context listener
        listener = fdc3.addContextListener(null, async (context) => {
          expect(context.type).to.be.equals("fdc3.instrument", errorMessage);
          receivedContext = true;
        });

        validateListenerObject(listener);

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
        await fdc3.joinChannel(channel.id);

        let receivedContext = false;

        //Add fdc3.instrument context listener
        listener = fdc3.addContextListener(null, async (context) => {
          expect(context.type).to.be.equals("fdc3.instrument", errorMessage);
          receivedContext = true;
        });

        validateListenerObject(listener);

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

        //Add context listener
        listener = fdc3.addContextListener("fdc3.instrument", (context) => {
          expect(context.type).to.be.equals("fdc3.instrument", errorMessage);
          receivedContext = true;
        });

        validateListenerObject(listener);

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

        //Add context listener
        listener = fdc3.addContextListener("fdc3.instrument", (context) => {
          contextTypes.push(context.type);
          checkIfBothContextsReceived();
        });

        validateListenerObject(listener);

        //Add second context listener to app A
        listener2 = fdc3.addContextListener("fdc3.contact", (context) => {
          contextTypes.push(context.type);
          checkIfBothContextsReceived();
        });

        validateListenerObject(listener2);

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

        //Add fdc3.instrument context listener
        listener = fdc3.addContextListener("fdc3.instrument", (context) => {
          assert.fail(`${errorMessage} ${context.type} context received`);
        });

        validateListenerObject(listener);

        //Add fdc3.contact context listener
        listener2 = fdc3.addContextListener("fdc3.contact", (context) => {
          assert.fail(`${errorMessage} ${context.type} context received`);
        });

        validateListenerObject(listener2);

        const channels = await fdc3.getSystemChannels();
        if (channels.length < 1)
          assert.fail("No system channels available for app A");

        //Join a different channel to the one passed to channelsApp
        await fdc3.joinChannel(channels[0].id);

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

        //Add fdc3.instrument context listener
        listener = fdc3.addContextListener("fdc3.instrument", (context) => {
          assert.fail(`${errorMessage} ${context.type} context received`);
        });

        validateListenerObject(listener);

        //Join system channel 1
        const channel = await retrieveAndJoinChannel(1);

        //Unsubscribe from listeners
        if (listener !== undefined) {
          await listener.unsubscribe();
          listener = undefined;
        } else {
          assert.fail("Listener undefined", errorMessage);
        }

        openChannelApp(scTestId7, channel.id, JOIN_AND_BROADCAST);


        //Wait for ChannelsApp to execute
        await resolveExecutionCompleteListener;
      });

      const scTestId8 =
        "(UCFilteredContext4) Should not receive context when joining two different user channels before app B broadcasts the listened type to the first channel that was joined";
      it(scTestId8, async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- App A adds context listener of type fdc3.instrument\r\n- App A joins channel 1\r\n- App A joins channel 2\r\n- App B joins channel 1\r\n- App B broadcasts context of type fdc3.instrument${documentation}`;

        //Add fdc3.instrument context listener
        listener = fdc3.addContextListener(
          "fdc3.instrument",
          async (context) => {
            assert.fail(`${errorMessage} ${context.type} context received`);
          }
        );

        //ChannelsApp joins a channel and then joins another
        const channels = await fdc3.getSystemChannels();
        if (channels.length < 1)
          assert.fail("No system channels available for app A");

        //Join a channel before joining a different channel
        await fdc3.joinChannel(channels[0].id);
        await fdc3.joinChannel(channels[1].id);

        openChannelApp(scTestId8, channels[0].id, JOIN_AND_BROADCAST_TWICE);


        //Give listener time to receive context
        await wait();
      });

      const scTestId9 =
        "(UCFilteredContext5) Should not receive context when joining and then leaving a user channel before app B broadcasts the listened type to the same channel";
      it(scTestId9, async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- App A adds context listener of type fdc3.instrument\r\n- App A joins channel 1\r\n- App A leaves channel 1\r\n- App B joins channel 1\r\n- App B broadcasts context of type fdc3.instrument${documentation}`;

        //Add a context listeners to app A
        listener = fdc3.addContextListener("fdc3.instrument", (context) => {
          assert.fail(`${errorMessage} ${context.type} context received`);
        });

        validateListenerObject(listener);

        //Join system channel 1
        const channel = await retrieveAndJoinChannel(1);

        //App A leaves channel 1
        await fdc3.leaveCurrentChannel();

        openChannelApp(scTestId9, channel.id, JOIN_AND_BROADCAST)

        //Give listener time to receive context
        await wait();
      });
    });

  });