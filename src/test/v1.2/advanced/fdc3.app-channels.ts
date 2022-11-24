import { Listener, Channel, Context, getCurrentChannel } from "fdc3_1_2";
import { assert, expect } from "chai";
import constants from "../../../constants";
import APIDocumentation from "../../../apiDocuments";
import { DesktopAgent } from "fdc3_1_2/dist/api/DesktopAgent";
import { sleep, wait } from "../../../utils";
import { APP_CHANNEL_AND_BROADCAST, APP_CHANNEL_AND_BROADCAST_TWICE, buildChannelsAppContext, ChannelsAppConfig, closeChannelsAppWindow, commands, getUserChannel, initCompleteListener, JOIN_AND_BROADCAST, JOIN_AND_BROADCAST_TWICE, openChannelApp, retrieveAndJoinChannel, unsubscribeListeners, validateListenerObject, waitForContext } from "./channels-support";

declare let fdc3: DesktopAgent;
const documentation =
  "\r\nDocumentation: " + APIDocumentation.desktopAgent + "\r\nCause:";

export default () =>
  describe("fdc3.app-channels", () => {
    let listener: Listener;
    let listener2: Listener;

    describe("App channels", () => {
      beforeEach(async () => {
        await unsubscribeListeners(listener, listener2);
        await fdc3.leaveCurrentChannel();
      });

      afterEach(async function afterEach() {
        await closeChannelsAppWindow(this.currentTest.title);
      });

      const acTestId =
        "(ACBasicUsage1) Should receive context when app a adds a listener and app B broadcasts to the same app channel";
      it(acTestId, async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- App A retrieves an app channel\r\n- App A adds adds a context listener of type null\r\n- App B retrieves the same app channel as A\r\n- App B broadcasts context of type fdc3.instrument${documentation}`;

        //Retrieve an app channel
        const testChannel = await fdc3.getOrCreateChannel("test-channel");

        //Listen for when ChannelsApp execution is complete
        const resolveExecutionCompleteListener = initCompleteListener(acTestId)

        let receivedContext = false;

        //Add context listener
        listener = testChannel.addContextListener(null, async (context) => {
          expect(context.type).to.be.equals("fdc3.instrument", errorMessage);
          receivedContext = true;
        });

        validateListenerObject(listener);

        openChannelApp(acTestId, undefined, APP_CHANNEL_AND_BROADCAST )

        //Wait for ChannelsApp to execute
        await resolveExecutionCompleteListener;

        //Fail if no context received
        if (!receivedContext) {
          assert.fail(`No context received!\n${errorMessage}`);
        }
      });

      const acTestId2 =
        "(ACBasicUsage2) Should receive context when app B broadcasts context to an app channel before A retrieves current context";
      it(acTestId2, async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- App A & B retrieve the same app channel\r\n- App B broadcasts context of type fdc3.instrument\r\n- App A retrieves current context of type null${documentation}`;

        //Retrieve an app channel
        const testChannel = await fdc3.getOrCreateChannel("test-channel");

        //Listen for when ChannelsApp execution is complete
        const resolveExecutionCompleteListener = initCompleteListener(acTestId2)

        openChannelApp(acTestId2, null, APP_CHANNEL_AND_BROADCAST)

        //Wait for ChannelsApp the finish executing
        await resolveExecutionCompleteListener;

        let receivedContext = false;

        //Retrieve current context from channel
        await testChannel.getCurrentContext().then(async (context) => {
          expect(context.type).to.be.equals("fdc3.instrument", errorMessage);
          receivedContext = true;
        });

        //Fail if no context received
        if (!receivedContext) {
          assert.fail(`No context received!\n${errorMessage}`);
        }
      });

      const acTestId4 =
        "(ACFilteredContext1) Should only receive the listened context when app B broadcasts multiple contexts to the same app channel";
      it(acTestId4, async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- App A retrieves an app channel\r\n- App A adds a context listener of type fdc3.instrument\r\n- App B retrieves the same app channel as A\r\n- App B broadcasts a context of type fdc3.instrument and fdc3.contact${documentation}`;

        //Retrieve an app channel
        const testChannel = await fdc3.getOrCreateChannel("test-channel");

        //Listen for when ChannelsApp execution is complete
        const resolveExecutionCompleteListener = initCompleteListener(acTestId4)

        let receivedContext = false;

        //Add context listener
        listener = testChannel.addContextListener(
          "fdc3.instrument",
          (context) => {
            expect(context.type).to.be.equals("fdc3.instrument", errorMessage);
            receivedContext = true;
          }
        );

        validateListenerObject(listener);

        openChannelApp(acTestId4, null, APP_CHANNEL_AND_BROADCAST_TWICE)


        //Wait for ChannelsApp to execute
        await resolveExecutionCompleteListener;

        //Fail if no context received
        if (!receivedContext) {
          assert.fail(`No context received!\n${errorMessage}`);
        }
      });

      const acTestId5 =
        "(ACFilteredContext2) Should receive multiple contexts when app B broadcasts the listened types to the same app channel";
      it(acTestId5, async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- App A retrieves an app channel\r\n- App A adds a context listener of type fdc3.instrument and fdc3.contact\r\n- App B retrieves the same app channel as A\r\n- App B broadcasts a context of type fdc3.instrument and fdc3.contact${documentation}`;

        let contextTypes: string[] = [];
        //Retrieve an app channel
        const testChannel = await fdc3.getOrCreateChannel("test-channel");

        //Listen for when ChannelsApp execution is complete
        const resolveExecutionCompleteListener = initCompleteListener(acTestId5)

        //Add fdc3.instrument context listener
        listener = testChannel.addContextListener(
          "fdc3.instrument",
          (context) => {
            contextTypes.push(context.type);
            checkIfBothContextsReceived();
          }
        );

        validateListenerObject(listener);

        //Add fdc3.contact context listener
        listener2 = testChannel.addContextListener(
          "fdc3.contact",
          (context) => {
            contextTypes.push(context.type);
            checkIfBothContextsReceived();
          }
        );

        validateListenerObject(listener2);

        const channelsAppCommands = [
          commands.retrieveTestAppChannel,
          commands.broadcastInstrumentContext,
          commands.broadcastContactContext,
        ];

        const channelsAppConfig: ChannelsAppConfig = {
          fdc3ApiVersion: "1.2",
          testId: acTestId5,
          notifyAppAOnCompletion: true,
        };

        //Open ChannelsApp then execute commands in order
        await fdc3.open(
          "ChannelsApp",
          buildChannelsAppContext(channelsAppCommands, channelsAppConfig)
        );

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

        //Wait for ChannelsApp to execute
        await resolveExecutionCompleteListener;

        //Fail if no context received
        if (!receivedContext) {
          assert.fail(`No context received!\n${errorMessage}`);
        }
      });

      const acTestId6 =
        "(ACUnsubscribe) Should not receive context when unsubscribing an app channel before app B broadcasts to that channel";
      it(acTestId6, async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- App A retrieves an app channel\r\n- App A adds a context listener of type null\r\n- App A unsubscribes the app channel\r\n- App B retrieves the same app channel\r\n- App B broadcasts a context of type fdc3.instrument and fdc3.contact${documentation}`;

        //Retrieve an app channel
        const testChannel = await fdc3.getOrCreateChannel("test-channel");

        //Listen for when ChannelsApp execution is complete
        const resolveExecutionCompleteListener =initCompleteListener(acTestId6)

        //Add context listener
        listener = testChannel.addContextListener(null, (context) => {
          assert.fail(`${errorMessage} ${context.type} context received`);
        });

        validateListenerObject(listener);

        //Unsubscribe from app channel
        listener.unsubscribe();

        const channelsAppCommands = [
          commands.retrieveTestAppChannel,
          commands.broadcastInstrumentContext,
          commands.broadcastContactContext,
        ];

        const channelsAppConfig: ChannelsAppConfig = {
          fdc3ApiVersion: "1.2",
          testId: acTestId6,
          notifyAppAOnCompletion: true,
        };

        //Open ChannelsApp then execute commands in order
        await fdc3.open(
          "ChannelsApp",
          buildChannelsAppContext(channelsAppCommands, channelsAppConfig)
        );

        //Wait for ChannelsApp to execute
        await resolveExecutionCompleteListener;
      });

      const acTestId7 =
        "(ACFilteredContext3) Should not receive context when app B broadcasts context to a different app channel";
      it(acTestId7, async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- App A retrieves an app channel\r\n- App A adds a context listener of type fdc3.instrument\r\n- App B retrieves a different app channel\r\n- App B broadcasts a context of type fdc3.instrument${documentation}`;

        //Retrieve an app channel
        const testChannel = await fdc3.getOrCreateChannel(
          "a-different-test-channel"
        );

        //Add context listener
        listener = testChannel.addContextListener(
          "fdc3.instrument",
          (context) => {
            assert.fail(`${errorMessage} ${context.type} context received`);
          }
        );

        validateListenerObject(listener);

        const channelsAppCommands = [
          commands.retrieveTestAppChannel,
          commands.broadcastInstrumentContext,
        ];

        const channelsAppConfig: ChannelsAppConfig = {
          fdc3ApiVersion: "1.2",
          testId: acTestId7,
          notifyAppAOnCompletion: true,
        };

        //Open ChannelsApp then execute commands in order
        await fdc3.open(
          "ChannelsApp",
          buildChannelsAppContext(channelsAppCommands, channelsAppConfig)
        );

        //Give listener time to receive context
        await wait();
      });

      const acTestId8 =
        "(ACFilteredContext4) Should not receive context when retrieving two different app channels before app B broadcasts the listened type to the first channel that was retrieved";
      it(acTestId8, async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- App A retrieves an app channel\r\n- App A switches to a different app channel\r\n- App A adds a context listener of type fdc3.instrument\r\n- App B retrieves the first channel that A retrieved\r\n- App B broadcasts a context of type fdc3.instrument${documentation}`;

        //Retrieve an app channel
        let testChannel = await fdc3.getOrCreateChannel("test-channel");

        //Listen for when ChannelsApp execution is complete
        const resolveExecutionCompleteListener = initCompleteListener(acTestId8)

        //App A retrieves a different app channel
        testChannel = await fdc3.getOrCreateChannel("a-different-test-channel");

        //Add context listener
        listener = testChannel.addContextListener(
          "fdc3.instrument",
          (context) => {
            assert.fail(`${errorMessage} ${context.type} context received`);
          }
        );

        validateListenerObject(listener);

        const channelsAppCommands = [
          commands.retrieveTestAppChannel,
          commands.broadcastInstrumentContext,
        ];

        const channelsAppConfig: ChannelsAppConfig = {
          fdc3ApiVersion: "1.2",
          testId: acTestId8,
          notifyAppAOnCompletion: true,
        };

        //Open ChannelsApp then execute commands in order
        await fdc3.open(
          "ChannelsApp",
          buildChannelsAppContext(channelsAppCommands, channelsAppConfig)
        );

        //Wait for ChannelsApp to execute
        await resolveExecutionCompleteListener;
      });

      const acTestId9 =
        "(ACContextHistoryTyped) Should receive both contexts when app B broadcasts both contexts to the same app channel and A gets current context for each type";
      it(acTestId9, async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- App A retrieves an app channel\r\n- App B retrieves the same app channel\r\n- App B broadcasts a context of type fdc3.instrument and fdc3.contact\r\n- App A gets current context for types fdc3.instrument and fdc3.contact${documentation}`;

        //Retrieve an app channel
        const testChannel = await fdc3.getOrCreateChannel("test-channel");

        const channelsAppCommands = [
          commands.retrieveTestAppChannel,
          commands.broadcastInstrumentContext,
          commands.broadcastContactContext,
        ];

        const channelsAppConfig: ChannelsAppConfig = {
          fdc3ApiVersion: "1.2",
          testId: acTestId9,
        };

        //Open ChannelsApp then execute commands in order
        await fdc3.open(
          "ChannelsApp",
          buildChannelsAppContext(channelsAppCommands, channelsAppConfig)
        );

        //get contexts from ChannelsApp
        const context = await testChannel.getCurrentContext("fdc3.instrument");
        expect(context.name).to.be.equals("History-item-1", errorMessage);

        const contactContext = await testChannel.getCurrentContext(
          "fdc3.contact"
        );
        expect(contactContext.name).to.be.equals(
          "History-item-1",
          errorMessage
        );
      });

      const acTestId10 =
        "(ACContextHistoryMultiple) Should retrieve the last broadcast context item when app B broadcasts a context with multiple history items to the same app channel and A gets current context";
      it(acTestId10, async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- App A retrieves an app channel\r\n- App B retrieves the same app channel\r\n- App B broadcasts two different contexts of type fdc3.instrument\r\n- App A gets current context for types fdc3.instrument${documentation}`;

        //Retrieve an app channel
        const testChannel = await fdc3.getOrCreateChannel("test-channel");

        //Listen for when ChannelsApp execution is complete
        const resolveExecutionCompleteListener = initCompleteListener(acTestId10)

        const channelsAppCommands = [
          commands.retrieveTestAppChannel,
          commands.broadcastInstrumentContext,
          commands.broadcastContactContext,
        ];

        const channelsAppConfig: ChannelsAppConfig = {
          fdc3ApiVersion: "1.2",
          testId: acTestId10,
          notifyAppAOnCompletion: true,
          historyItems: 2,
        };

        //Open ChannelsApp and execute commands in order
        await fdc3.open(
          "ChannelsApp",
          buildChannelsAppContext(channelsAppCommands, channelsAppConfig)
        );

        //Wait for ChannelsApp to execute
        await resolveExecutionCompleteListener;

        //Retrieve fdc3.instrument context
        const context = await testChannel.getCurrentContext("fdc3.instrument");
        expect(context.type).to.be.equals("fdc3.instrument", errorMessage);
        expect(context.name).to.be.equals("History-item-2", errorMessage);

        const context2 = await testChannel.getCurrentContext("fdc3.contact");
        expect(context2.type).to.be.equals("fdc3.contact", errorMessage);
        expect(context2.name).to.be.equals("History-item-2", errorMessage);
      });

      const acTestId11 =
        "(ACContextHistoryLast) Should retrieve the last broadcast context item when app B broadcasts two different contexts to the same app channel and A gets current context";
      it(acTestId11, async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- App A retrieves an app channel\r\n- App B retrieves the same app channel\r\n- App B broadcasts a context of type fdc3.instrument and fdc3.contact\r\n- App B gets current context with no filter applied${documentation}`;

        //Retrieve an app channel
        const testChannel = await fdc3.getOrCreateChannel("test-channel");

        //Listen for when ChannelsApp execution is complete
        const resolveExecutionCompleteListener = initCompleteListener(acTestId11)

        const channelsAppCommands = [
          commands.retrieveTestAppChannel,
          commands.broadcastInstrumentContext,
          commands.broadcastContactContext,
        ];

        const channelsAppConfig: ChannelsAppConfig = {
          fdc3ApiVersion: "1.2",
          testId: acTestId11,
          notifyAppAOnCompletion: true,
        };

        //Open ChannelsApp then execute commands in order
        await fdc3.open(
          "ChannelsApp",
          buildChannelsAppContext(channelsAppCommands, channelsAppConfig)
        );

        //Wait for ChannelsApp to execute
        await resolveExecutionCompleteListener;

        const context = await testChannel.getCurrentContext();

        if (context === null) {
          assert.fail("No Context retrieved", errorMessage);
        } else if (context.type === "fdc3.instrument") {
          assert.fail(
            "Did not retrieve last broadcast context from app B",
            errorMessage
          );
        } else {
          expect(context.type).to.be.equals("fdc3.contact", errorMessage);
        }
      });
    });
  });
