import { Listener, Channel, Context } from "fdc3_2_0";
import { assert, expect } from "chai";
import constants from "../../../constants";
import APIDocumentation from "../../../apiDocuments";
import { DesktopAgent } from "fdc3_2_0/dist/api/DesktopAgent";
import { sleep, wait } from "../../../utils";

declare let fdc3: DesktopAgent;
const documentation =
  "\r\nDocumentation: " + APIDocumentation.desktopAgent + "\r\nCause:";

export interface AppControlContext extends Context {
  testId?: string;
}

export default () =>
  describe("fdc3.broadcast", () => {
    let listener: Listener;
    let listener2: Listener;
    let executionListener: Listener;

    it("Broadcast method is callable", async () => {
      await fdc3.broadcast({
        type: "fdc3.instrument",
        id: { ticker: "AAPL" },
      });
    });

    describe("System channels", () => {
      beforeEach(async () => {
        await unsubscribeListeners();
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
        const resolveExecutionCompleteListener = waitForContext(
          "executionComplete",
          scTestId1,
          await fdc3.getOrCreateChannel("app-control")
        );
        let receivedContext = false;

        //Add context listener
        listener = await fdc3.addContextListener(null, async (context) => {
          expect(context.type).to.be.equals("fdc3.instrument", errorMessage);
          receivedContext = true;
        });

        validateListenerObject(listener);

        //Join user channel 1
        await joinChannel(1);

        const channelsAppCommands = [
          commands.joinUserChannelOne,
          commands.broadcastInstrumentContext,
        ];

        const channelsAppConfig: ChannelsAppConfig = {
          fdc3ApiVersion: "2.0",
          testId: scTestId1,
          notifyAppAOnCompletion: true,
        };

        //Open ChannelsApp then execute commands in order
        await fdc3.open(
          { appId: "ChannelsAppId" },
          buildChannelsAppContext(channelsAppCommands, channelsAppConfig)
        );

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
        const resolveExecutionCompleteListener = waitForContext(
          "executionComplete",
          scTestId2,
          await fdc3.getOrCreateChannel("app-control")
        );

        //Join user channel 1
        await joinChannel(1);

        let receivedContext = false;

        //Add fdc3.instrument context listener
        listener = await fdc3.addContextListener(null, async (context) => {
          expect(context.type).to.be.equals("fdc3.instrument", errorMessage);
          receivedContext = true;
        });

        validateListenerObject(listener);

        const channelsAppCommands = [
          commands.joinUserChannelOne,
          commands.broadcastInstrumentContext,
        ];

        const channelsAppConfig: ChannelsAppConfig = {
          fdc3ApiVersion: "2.0",
          testId: scTestId2,
          notifyAppAOnCompletion: true,
        };

        //Open ChannelsApp then execute commands in order
        await fdc3.open(
          { appId: "ChannelsAppId" },
          buildChannelsAppContext(channelsAppCommands, channelsAppConfig)
        );

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
        const resolveExecutionCompleteListener = waitForContext(
          "executionComplete",
          scTestId3,
          await fdc3.getOrCreateChannel("app-control")
        );

        const channelsAppCommands = [
          commands.joinUserChannelOne,
          commands.broadcastInstrumentContext,
        ];

        const channelsAppConfig: ChannelsAppConfig = {
          fdc3ApiVersion: "2.0",
          testId: scTestId3,
          notifyAppAOnCompletion: true,
        };

        //Open ChannelsApp then execute commands in order
        await fdc3.open(
          { appId: "ChannelsAppId" },
          buildChannelsAppContext(channelsAppCommands, channelsAppConfig)
        );

        //Join user channel 1
        await joinChannel(1);

        let receivedContext = false;

        //Add fdc3.instrument context listener
        listener = await fdc3.addContextListener(null, async (context) => {
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
        "(UCFilteredContext1) Should receive context when app A adds a listener before joining a user channel, then app B broadcasts the listened type to the same user channel";
      it(scTestId4, async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- App A adds fdc3.instrument context listener\r\n- App A joins channel 1\r\n- App B joins channel 1\r\n- App B broadcasts context of type fdc3.instrument${documentation}`;

        //Listen for when ChannelsApp execution is complete
        const resolveExecutionCompleteListener = waitForContext(
          "executionComplete",
          scTestId4,
          await fdc3.getOrCreateChannel("app-control")
        );

        let receivedContext = false;

        //Add context listener
        listener = await fdc3.addContextListener(
          "fdc3.instrument",
          (context) => {
            expect(context.type).to.be.equals("fdc3.instrument", errorMessage);
            receivedContext = true;
          }
        );

        validateListenerObject(listener);

        //Join user channel 1
        joinChannel(1);

        const channelsAppCommands = [
          commands.joinUserChannelOne,
          commands.broadcastInstrumentContext,
          commands.broadcastContactContext,
        ];

        const channelsAppConfig: ChannelsAppConfig = {
          fdc3ApiVersion: "2.0",
          testId: scTestId4,
          notifyAppAOnCompletion: true,
        };

        //Open ChannelsApp then execute commands in order
        await fdc3.open(
          { appId: "ChannelsAppId" },
          buildChannelsAppContext(channelsAppCommands, channelsAppConfig)
        );

        //Wait for ChannelsApp to execute
        await resolveExecutionCompleteListener;

        //Fail if no context received
        if (!receivedContext) {
          assert.fail(`No context received!\n${errorMessage}`);
        }
      });

      const scTestId5 =
        "(UCFilteredContext2) Should receive context when app A joins a user channel before adding a context listener, then app B broadcasts the listened type to the same user channel";
      it(scTestId5, async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- App A joins channel 1\r\n- App A adds fdc3.instrument context listener\r\n- App B joins channel 1\r\n- App B broadcasts context of type fdc3.instrument${documentation}`;

        //Listen for when ChannelsApp execution is complete
        const resolveExecutionCompleteListener = waitForContext(
          "executionComplete",
          scTestId5,
          await fdc3.getOrCreateChannel("app-control")
        );

        //Join user channel 1
        joinChannel(1);

        let receivedContext = false;

        //Add context listener
        listener = await fdc3.addContextListener(
          "fdc3.instrument",
          (context) => {
            expect(context.type).to.be.equals("fdc3.instrument", errorMessage);
            receivedContext = true;
          }
        );

        validateListenerObject(listener);

        const channelsAppCommands = [
          commands.joinUserChannelOne,
          commands.broadcastInstrumentContext,
          commands.broadcastContactContext,
        ];

        const channelsAppConfig: ChannelsAppConfig = {
          fdc3ApiVersion: "2.0",
          testId: scTestId5,
          notifyAppAOnCompletion: true,
        };

        //Open ChannelsApp then execute commands in order
        await fdc3.open(
          { appId: "ChannelsAppId" },
          buildChannelsAppContext(channelsAppCommands, channelsAppConfig)
        );

        //Wait for ChannelsApp to execute
        await resolveExecutionCompleteListener;

        //reject if no context received
        if (!receivedContext) {
          assert.fail("No context received" + errorMessage);
        }
      });

      const scTestId6 =
        "(UCFilteredContext3) Should receive context when app B broadcasts context to a user channel before A adds a listener of the same type broadcast by B and joins the same user channel";
      it(scTestId6, async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- App A adds fdc3.instrument context listener\r\n- App A joins channel 1\r\n- App B joins channel 1\r\n- App B broadcasts context of type fdc3.instrument${documentation}`;

        //Listen for when ChannelsApp execution is complete
        const resolveExecutionCompleteListener = waitForContext(
          "executionComplete",
          scTestId6,
          await fdc3.getOrCreateChannel("app-control")
        );

        const channelsAppCommands = [
          commands.joinUserChannelOne,
          commands.broadcastInstrumentContext,
          commands.broadcastContactContext,
        ];

        const channelsAppConfig: ChannelsAppConfig = {
          fdc3ApiVersion: "2.0",
          testId: scTestId6,
          notifyAppAOnCompletion: true,
        };

        //Open ChannelsApp then execute commands in order
        await fdc3.open(
          { appId: "ChannelsAppId" },
          buildChannelsAppContext(channelsAppCommands, channelsAppConfig)
        );

        //Wait for ChannelsApp to execute
        await resolveExecutionCompleteListener;

        let receivedContext = false;

        //Add context listener
        listener = await fdc3.addContextListener(
          "fdc3.instrument",
          (context) => {
            expect(context.type).to.be.equals("fdc3.instrument", errorMessage);
            receivedContext = true;
          }
        );

        validateListenerObject(listener);

        //Join user channel 1
        joinChannel(1);

        //reject if no context received
        if (!receivedContext) {
          assert.fail("No context received" + errorMessage);
        }
      });

      const scTestId7 =
        "(UCFilteredContext4) Should receive context when app B broadcasts context to a user channel before A joins the same user channel and adds a listener of the same type that was broadcast by B";
      it(scTestId7, async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- App A joins channel 1\r\n- App A adds fdc3.instrument context listener\r\n- App B joins channel 1\r\n- App B broadcasts context of type fdc3.instrument${documentation}`;

        //Listen for when ChannelsApp execution is complete
        const resolveExecutionCompleteListener = waitForContext(
          "executionComplete",
          scTestId7,
          await fdc3.getOrCreateChannel("app-control")
        );

        const channelsAppCommands = [
          commands.joinUserChannelOne,
          commands.broadcastInstrumentContext,
          commands.broadcastContactContext,
        ];

        const channelsAppConfig: ChannelsAppConfig = {
          fdc3ApiVersion: "2.0",
          testId: scTestId7,
          notifyAppAOnCompletion: true,
        };

        //Open ChannelsApp then execute commands in order
        await fdc3.open(
          { appId: "ChannelsAppId" },
          buildChannelsAppContext(channelsAppCommands, channelsAppConfig)
        );

        //Wait for ChannelsApp to execute
        await resolveExecutionCompleteListener;

        //Join user channel 1
        joinChannel(1);

        let receivedContext = false;

        //Add context listener
        listener = await fdc3.addContextListener(
          "fdc3.instrument",
          (context) => {
            expect(context.type).to.be.equals("fdc3.instrument", errorMessage);
            receivedContext = true;
          }
        );

        validateListenerObject(listener);

        //Fail if no context received
        if (!receivedContext) {
          assert.fail(`No context received!\n${errorMessage}`);
        }
      });

      const scTestId8 =
        "(UCFilteredContext5) Should receive multiple contexts when app B broadcasts the listened types to the same user channel";
      it(scTestId7, async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- App A adds fdc3.instrument and fdc3.contact context listener\r\n- App A joins channel 1\r\n- App B joins channel 1\r\n- App B broadcasts both context types${documentation}`;

        //Listen for when ChannelsApp execution is complete
        const resolveExecutionCompleteListener = waitForContext(
          "executionComplete",
          scTestId8,
          await fdc3.getOrCreateChannel("app-control")
        );
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
        listener = await fdc3.addContextListener(
          "fdc3.instrument",
          (context) => {
            contextTypes.push(context.type);
            checkIfBothContextsReceived();
          }
        );

        validateListenerObject(listener);

        //Add second context listener to app A
        listener2 = await fdc3.addContextListener("fdc3.contact", (context) => {
          contextTypes.push(context.type);
          checkIfBothContextsReceived();
        });

        validateListenerObject(listener2);

        //Join user channel 1
        await joinChannel(1);

        const channelsAppCommands = [
          commands.joinUserChannelOne,
          commands.broadcastInstrumentContext,
          commands.broadcastContactContext,
        ];

        const channelsAppConfig: ChannelsAppConfig = {
          fdc3ApiVersion: "2.0",
          testId: scTestId8,
          notifyAppAOnCompletion: true,
        };

        //Open ChannelsApp then execute commands in order
        await fdc3.open(
          { appId: "ChannelsAppId" },
          buildChannelsAppContext(channelsAppCommands, channelsAppConfig)
        );

        //Wait for ChannelsApp to execute
        await resolveExecutionCompleteListener;

        //Reject if no context received
        if (!receivedContext) {
          assert.fail(`${errorMessage} At least one context was not received`);
        }
      });

      const scTestId9 =
        "(UCFilteredContext6) Should not receive context when A & B join different user channels and app B broadcasts a listened type";
      it(scTestId9, async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- App A adds fdc3.instrument and fdc3.contact context listener\r\n- App A joins channel 2\r\n- App B joins channel 1\r\n- App B broadcasts both context types${documentation}`;
        let timeout;

        //Add fdc3.instrument context listener
        listener = await fdc3.addContextListener(
          "fdc3.instrument",
          (context) => {
            clearTimeout(timeout);
            assert.fail(`${errorMessage} ${context.type} context received`);
          }
        );

        validateListenerObject(listener);

        //Add fdc3.contact context listener
        listener2 = await fdc3.addContextListener("fdc3.contact", (context) => {
          assert.fail(`${errorMessage} ${context.type} context received`);
        });

        validateListenerObject(listener2);

        //ChannelsApp joins channel 2
        await joinChannel(2);

        const channelsAppCommands = [
          commands.joinUserChannelOne,
          commands.broadcastInstrumentContext,
          commands.broadcastContactContext,
        ];

        const channelsAppConfig: ChannelsAppConfig = {
          fdc3ApiVersion: "2.0",
          testId: scTestId9,
        };

        //Open ChannelsApp then execute commands in order
        await fdc3.open(
          { appId: "ChannelsAppId" },
          buildChannelsAppContext(channelsAppCommands, channelsAppConfig)
        );

        //Give listener time to receive context
        const { promise: sleepPromise, timeout: theTimeout } = sleep();
        timeout = theTimeout;
      });
    });

    const scTestId10 =
      "(UCFilteredContext7) Should not receive context when unsubscribing a user channel before app B broadcasts the listened type to that channel";
    it(scTestId10, async () => {
      const errorMessage = `\r\nSteps to reproduce:\r\n- App A adds context listener of type fdc3.instrument\r\n- App A joins channel 1\r\n- App A unsubscribes the listener\r\n- App B joins channel 1\r\n- App B broadcasts context of type fdc3.instrument${documentation}`;

      //Listen for when ChannelsApp execution is complete
      const resolveExecutionCompleteListener = waitForContext(
        "executionComplete",
        scTestId10,
        await fdc3.getOrCreateChannel("app-control")
      );

      //Add fdc3.instrument context listener
      listener = await fdc3.addContextListener("fdc3.instrument", (context) => {
        assert.fail(`${errorMessage} ${context.type} context received`);
      });

      validateListenerObject(listener);

      //Join user channel 1
      await joinChannel(1);

      //Unsubscribe from listeners
      if (listener !== undefined) {
        await listener.unsubscribe();
        listener = undefined;
      } else {
        assert.fail("Listener undefined", errorMessage);
      }

      const channelsAppCommands = [
        commands.joinUserChannelOne,
        commands.broadcastInstrumentContext,
      ];

      const channelsAppConfig: ChannelsAppConfig = {
        fdc3ApiVersion: "2.0",
        testId: scTestId10,
        notifyAppAOnCompletion: true,
      };

      //Open ChannelsApp then execute commands in order
      await fdc3.open(
        { appId: "ChannelsAppId" },
        buildChannelsAppContext(channelsAppCommands, channelsAppConfig)
      );

      //Wait for ChannelsApp to execute
      await resolveExecutionCompleteListener;
    });

    const scTestId11 =
      "(UCFilteredContext8) Should not receive context when joining two different user channels before app B broadcasts the listened type to the first channel that was joined";
    it(scTestId11, async () => {
      const errorMessage = `\r\nSteps to reproduce:\r\n- App A adds context listener of type fdc3.instrument\r\n- App A joins channel 1\r\n- App A joins channel 2\r\n- App B joins channel 1\r\n- App B broadcasts context of type fdc3.instrument${documentation}`;
      let timeout;

      //Add fdc3.instrument context listener
      listener = await fdc3.addContextListener(
        "fdc3.instrument",
        async (context) => {
          assert.fail(`${errorMessage} ${context.type} context received`);
        }
      );

      //ChannelsApp joins a channel and then joins another
      await joinChannel(1);
      await joinChannel(2);

      const channelsAppCommands = [
        commands.joinUserChannelOne,
        commands.broadcastInstrumentContext,
      ];

      const channelsAppConfig: ChannelsAppConfig = {
        fdc3ApiVersion: "2.0",
        testId: scTestId11,
      };

      //Open ChannelsApp then execute commands in order
      await fdc3.open(
        { appId: "ChannelsAppId" },
        buildChannelsAppContext(channelsAppCommands, channelsAppConfig)
      );

      //Give listener time to receive context
      const { promise: sleepPromise, timeout: theTimeout } = sleep();
      timeout = theTimeout;
      await sleepPromise;
    });

    const scTestId12 =
      "(UCFilteredContext9) Should not receive context when joining and then leaving a user channel before app B broadcasts the listened type to the same channel";
    it(scTestId12, async () => {
      const errorMessage = `\r\nSteps to reproduce:\r\n- App A adds context listener of type fdc3.instrument\r\n- App A joins channel 1\r\n- App A leaves channel 1\r\n- App B joins channel 1\r\n- App B broadcasts context of type fdc3.instrument${documentation}`;
      let timeout;
      //Add a context listeners to app A
      listener = await fdc3.addContextListener("fdc3.instrument", (context) => {
        assert.fail(`${errorMessage} ${context.type} context received`);
      });

      validateListenerObject(listener);

      //Join user channel 1
      await joinChannel(1);

      //App A leaves channel 1
      await fdc3.leaveCurrentChannel();

      const channelsAppCommands = [
        commands.joinUserChannelOne,
        commands.broadcastInstrumentContext,
      ];

      const channelsAppConfig: ChannelsAppConfig = {
        fdc3ApiVersion: "2.0",
        testId: scTestId12,
        notifyAppAOnCompletion: true,
      };

      //Open ChannelsApp then execute commands in order
      await fdc3.open(
        { appId: "ChannelsAppId" },
        buildChannelsAppContext(channelsAppCommands, channelsAppConfig)
      );

      //Give listener time to receive context
      const { promise: sleepPromise, timeout: theTimeout } = sleep();
      timeout = theTimeout;
      await sleepPromise;
    });

    describe("App channels", () => {
      beforeEach(async () => {
        await unsubscribeListeners();
        await fdc3.leaveCurrentChannel();
      });

      afterEach(async function afterEach() {
        await closeChannelsAppWindow(this.currentTest.title);
      });

      const acTestId =
        "(ACBasicUsage1) Should receive context when app a adds a listener and app B broadcasts to the same app channel";
      it(acTestId, async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- App A retrieves an app channel\r\n- App A adds adds a context listener of type null\r\n- App B retrieves the same app channel as A\r\n- App B broadcasts context of type fdc3.instrument${documentation}`;

        //Listen for when ChannelsApp execution is complete
        const resolveExecutionCompleteListener = waitForContext(
          "executionComplete",
          acTestId,
          await fdc3.getOrCreateChannel("app-control")
        );

        //Retrieve an app channel
        const testChannel = await fdc3.getOrCreateChannel("test-channel");
        let receivedContext = false;

        //Add context listener
        listener = await testChannel.addContextListener(
          null,
          async (context) => {
            expect(context.type).to.be.equals("fdc3.instrument", errorMessage);
            receivedContext = true;
          }
        );

        validateListenerObject(listener);

        const channelsAppCommands = [
          commands.retrieveTestAppChannel,
          commands.broadcastInstrumentContext,
        ];

        const channelsAppConfig: ChannelsAppConfig = {
          fdc3ApiVersion: "2.0",
          testId: acTestId,
          notifyAppAOnCompletion: true,
        };

        //Open ChannelsApp then execute commands in order
        await fdc3.open(
          { appId: "ChannelsAppId" },
          buildChannelsAppContext(channelsAppCommands, channelsAppConfig)
        );

        //Wait for ChannelsApp to execute
        await resolveExecutionCompleteListener;

        //Fail if no context received
        if (!receivedContext) {
          assert.fail(
            `At least one context was not received!\n${errorMessage}`
          );
        }
      });

      const acTestId2 =
        "(ACBasicUsage2) Should receive context when app B broadcasts context to an app channel before A retrieves current context";
      it(acTestId2, async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- App A & B retrieve the same app channel\r\n- App B broadcasts context of type fdc3.instrument\r\n- App A retrieves current context of type null${documentation}`;

        //Listen for when ChannelsApp execution is complete
        const resolveExecutionCompleteListener = waitForContext(
          "executionComplete",
          acTestId2,
          await fdc3.getOrCreateChannel("app-control")
        );

        //Retrieve an app channel
        const testChannel = await fdc3.getOrCreateChannel("test-channel");

        const channelsAppCommands = [
          commands.retrieveTestAppChannel,
          commands.broadcastInstrumentContext,
        ];

        const channelsAppConfig: ChannelsAppConfig = {
          fdc3ApiVersion: "2.0",
          testId: acTestId2,
          notifyAppAOnCompletion: true,
        };

        //Open ChannelsApp then execute commands in order
        await fdc3.open(
          { appId: "ChannelsAppId" },
          buildChannelsAppContext(channelsAppCommands, channelsAppConfig)
        );

        let receivedContext = false;

        //Retrieve current context from channel
        await testChannel.getCurrentContext().then(async (context) => {
          expect(context.type).to.be.equals("fdc3.instrument", errorMessage);
          receivedContext = true;
        });

        //Wait for ChannelsApp the finish executing
        await resolveExecutionCompleteListener;

        //Fail if no context received
        if (!receivedContext) {
          assert.fail(`No context received!\n${errorMessage}`);
        }
      });

      const acTestId4 =
        "(ACFilteredContext1) Should only receive the listened context when app B broadcasts multiple contexts to the same app channel";
      it(acTestId4, async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- App A retrieves an app channel\r\n- App A adds a context listener of type fdc3.instrument\r\n- App B retrieves the same app channel as A\r\n- App B broadcasts a context of type fdc3.instrument and fdc3.contact${documentation}`;

        //Listen for when ChannelsApp execution is complete
        const resolveExecutionCompleteListener = waitForContext(
          "executionComplete",
          acTestId4,
          await fdc3.getOrCreateChannel("app-control")
        );

        let receivedContext = false;

        //Retrieve an app channel
        const testChannel = await fdc3.getOrCreateChannel("test-channel");

        //Add context listener
        listener = await testChannel.addContextListener(
          "fdc3.instrument",
          (context) => {
            expect(context.type).to.be.equals("fdc3.instrument", errorMessage);
            receivedContext = true;
          }
        );

        validateListenerObject(listener);

        const channelsAppCommands = [
          commands.retrieveTestAppChannel,
          commands.broadcastInstrumentContext,
          commands.broadcastContactContext,
        ];

        const channelsAppConfig: ChannelsAppConfig = {
          fdc3ApiVersion: "2.0",
          testId: acTestId4,
          notifyAppAOnCompletion: true,
        };

        //Open ChannelsApp then execute commands in order
        await fdc3.open(
          { appId: "ChannelsAppId" },
          buildChannelsAppContext(channelsAppCommands, channelsAppConfig)
        );

        //Wait for ChannelsApp to execute
        await resolveExecutionCompleteListener;

        //Fail if no context received
        if (!receivedContext) {
          assert.fail(`No context received!\n${errorMessage}`);
        }
      });

      const acTestId7 =
        "(ACFilteredContext2) Should not receive context when app B broadcasts context to a different app channel";
      it(acTestId7, async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- App A retrieves an app channel\r\n- App A adds a context listener of type fdc3.instrument\r\n- App B retrieves a different app channel\r\n- App B broadcasts a context of type fdc3.instrument${documentation}`;
        let timeout;
        //Retrieve an app channel
        const testChannel = await fdc3.getOrCreateChannel(
          "a-different-test-channel"
        );

        //Add context listener
        listener = await testChannel.addContextListener(
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
          fdc3ApiVersion: "2.0",
          testId: acTestId7,
        };

        //Open ChannelsApp then execute commands in order
        await fdc3.open(
          { appId: "ChannelsAppId" },
          buildChannelsAppContext(channelsAppCommands, channelsAppConfig)
        );

        //Give listener time to receive context
        const { promise: sleepPromise, timeout: theTimeout } = sleep();
        timeout = theTimeout;
        await sleepPromise;
      });

      const acTestId6 =
        "(ACUnsubscribe) Should not receive context when unsubscribing an app channel before app B broadcasts to that channel";
      it(acTestId6, async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- App A retrieves an app channel\r\n- App A adds a context listener of type null\r\n- App A unsubscribes the app channel\r\n- App B retrieves the same app channel\r\n- App B broadcasts a context of type fdc3.instrument and fdc3.contact${documentation}`;

        //Retrieve an app channel
        const testChannel = await fdc3.getOrCreateChannel("test-channel");

        //Listen for when ChannelsApp execution is complete
        const resolveExecutionCompleteListener = waitForContext(
          "executionComplete",
          acTestId6,
          await fdc3.getOrCreateChannel("app-control")
        );

        //Add context listener
        listener = await testChannel.addContextListener(null, (context) => {
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
          fdc3ApiVersion: "2.0",
          testId: acTestId6,
          notifyAppAOnCompletion: true,
        };

        //Open ChannelsApp then execute commands in order
        await fdc3.open(
          { appId: "ChannelsAppId" },
          buildChannelsAppContext(channelsAppCommands, channelsAppConfig)
        );

        //Wait for ChannelsApp to execute
        await resolveExecutionCompleteListener;
      });

      const acTestId10 =
        "(ACFilteredContext3) Should not receive context when retrieving two different app channels before app B broadcasts the listened type to the first channel that was retrieved";
      it(acTestId10, async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- App A retrieves an app channel\r\n- App A switches to a different app channel\r\n- App A adds a context listener of type fdc3.instrument\r\n- App B retrieves the first channel that A retrieved\r\n- App B broadcasts a context of type fdc3.instrument${documentation}`;

        //Listen for when ChannelsApp execution is complete
        const resolveExecutionCompleteListener = waitForContext(
          "executionComplete",
          acTestId10,
          await fdc3.getOrCreateChannel("app-control")
        );

        //Retrieve an app channel
        let testChannel = await fdc3.getOrCreateChannel("test-channel");

        listener = await testChannel.addContextListener(
          "fdc3.instrument",
          (context) => {
            assert.fail(`${errorMessage} ${context.type} context received`);
          }
        );

        validateListenerObject(listener);

        //App A retrieves a different app channel
        let testChannel2 = await fdc3.getOrCreateChannel(
          "a-different-test-channel"
        );

        //Add context listener
        listener2 = await testChannel2.addContextListener(
          "fdc3.instrument",
          (context) => {
            assert.fail(`${errorMessage} ${context.type} context received`);
          }
        );

        validateListenerObject(listener2);

        const channelsAppCommands = [
          commands.retrieveTestAppChannel,
          commands.broadcastInstrumentContext,
        ];

        const channelsAppConfig: ChannelsAppConfig = {
          fdc3ApiVersion: "2.0",
          testId: acTestId10,
          notifyAppAOnCompletion: true,
        };

        //Open ChannelsApp then execute commands in order
        await fdc3.open(
          { appId: "ChannelsAppId" },
          buildChannelsAppContext(channelsAppCommands, channelsAppConfig)
        );

        //Wait for ChannelsApp to execute
        await resolveExecutionCompleteListener;
      });

      const acTestId11 =
        "(ACContextHistoryTyped) Should receive both contexts when app B broadcasts both contexts to the same app channel and A gets current context for each type";
      it(acTestId11, async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- App A retrieves an app channel\r\n- App B retrieves the same app channel\r\n- App B broadcasts a context of type fdc3.instrument and fdc3.contact\r\n- App A gets current context for types fdc3.instrument and fdc3.contact${documentation}`;

        //Retrieve an app channel
        const testChannel = await fdc3.getOrCreateChannel("test-channel");

        const channelsAppCommands = [
          commands.retrieveTestAppChannel,
          commands.broadcastInstrumentContext,
          commands.broadcastContactContext,
        ];

        const channelsAppConfig: ChannelsAppConfig = {
          fdc3ApiVersion: "2.0",
          testId: acTestId11,
        };

        //Open ChannelsApp then execute commands in order
        await fdc3.open(
          { appId: "ChannelsApp" },
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

        const contextLatest = await testChannel.getCurrentContext();
        expect(contextLatest.type).to.be.equals("fdc3.contact", errorMessage);
      });

      const acTestId13 =
        "(ACContextHistoryMultiple) Should retrieve the last broadcast context item when app B broadcasts a context with multiple history items to the same app channel and A gets current context";
      it(acTestId13, async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- App A retrieves an app channel\r\n- App B retrieves the same app channel\r\n- App B broadcasts two different contexts of type fdc3.instrument\r\n- App A gets current context for types fdc3.instrument${documentation}`;

        //Retrieve an app channel
        const testChannel = await fdc3.getOrCreateChannel("test-channel");

        //Listen for when ChannelsApp execution is complete
        const resolveExecutionCompleteListener = waitForContext(
          "executionComplete",
          acTestId13,
          await fdc3.getOrCreateChannel("app-control")
        );

        const channelsAppCommands = [
          commands.retrieveTestAppChannel,
          commands.broadcastInstrumentContext,
          commands.broadcastContactContext,
        ];
        const channelsAppConfig: ChannelsAppConfig = {
          fdc3ApiVersion: "2.0",
          testId: acTestId13,
          notifyAppAOnCompletion: true,
          historyItems: 2,
        };

        //Open ChannelsApp and execute commands in order
        await fdc3.open(
          { appId: "ChannelsApp" },
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

        const contextLatest = await testChannel.getCurrentContext();
        expect(contextLatest.type).to.be.equals("fdc3.contact", errorMessage);
        expect(contextLatest.name).to.be.equals("History-item-2", errorMessage);
      });
    });

    const joinChannel = async (channel: number) => {
      const channels = await fdc3.getUserChannels();
      if (channels.length > 0) {
        await fdc3.joinUserChannel(channels[channel - 1].id);
      } else {
        assert.fail("No system channels available for app A");
      }
    };

    function validateListenerObject(listenerObject) {
      assert.isTrue(
        typeof listenerObject === "object",
        "No listener object found"
      );
      expect(typeof listenerObject.unsubscribe).to.be.equals(
        "function",
        "Listener does not contain an unsubscribe method"
      );
    }

    async function closeChannelsAppWindow(testId: string) {
      //Tell ChannelsApp to close window
      const appControlChannel = await broadcastAppChannelCloseWindow(testId);

      //Wait for ChannelsApp to respond
      await waitForContext("windowClosed", testId, appControlChannel);
      await wait(constants.WindowCloseWaitTime);
    }

    const broadcastAppChannelCloseWindow = async (testId: string) => {
      const appControlChannel = await fdc3.getOrCreateChannel("app-control");
      /* tslint:disable-next-line */
      const closeContext: AppControlContext = {
        type: "closeWindow",
        testId: testId,
      };
      await appControlChannel.broadcast(closeContext);
      return appControlChannel;
    };

    async function unsubscribeListeners() {
      if (listener !== undefined) {
        await listener.unsubscribe();
        listener = undefined;
      }

      if (listener2 !== undefined) {
        await listener2.unsubscribe();
        listener2 = undefined;
      }

      if (executionListener != undefined) {
        await executionListener.unsubscribe();
        executionListener = undefined;
      }
    }

    const waitForContext = (
      contextType: string,
      testId: string,
      channel?: Channel
    ): Promise<Context> => {
      let executionListener: Listener;
      return new Promise<Context>(async (resolve) => {
        console.log(
          Date.now() +
            ` Waiting for type: "${contextType}", on channel: "${channel.id}" in test: "${testId}"`
        );

        const handler = (context: AppControlContext) => {
          if (testId) {
            if (testId == context.testId) {
              console.log(
                Date.now() + ` Received ${contextType} for test: ${testId}`
              );
              resolve(context);
              if (executionListener) executionListener.unsubscribe();
            } else {
              console.warn(
                Date.now() +
                  ` Ignoring "${contextType}" context due to mismatched testId (expected: "${testId}", got "${context.testId}")`
              );
            }
          } else {
            console.log(
              Date.now() +
                ` Received (without testId) "${contextType}" for test: "${testId}"`
            );
            resolve(context);
            if (executionListener) executionListener.unsubscribe();
          }
        };

        if (channel === undefined) {
          executionListener = await fdc3.addContextListener(
            contextType,
            handler
          );
        } else {
          executionListener = await channel.addContextListener(
            contextType,
            handler
          );
          //App channels do not auto-broadcast current context when you start listening, so retrieve current context to avoid races
          const ccHandler = async (context: AppControlContext) => {
            if (context) {
              if (testId) {
                if (testId == context?.testId && context?.type == contextType) {
                  console.log(
                    Date.now() +
                      ` Received "${contextType}" (from current context) for test: "${testId}"`
                  );
                  if (executionListener) executionListener.unsubscribe();
                  resolve(context);
                } //do not warn as it will be ignoring mismatches which will be common
                else {
                  console.log(
                    Date.now() +
                      ` CHecking for current context of type "${contextType}" for test: "${testId}" Current context did ${
                        context ? "" : "NOT "
                      } exist, 
    had testId: "${context?.testId}" (${
                        testId == context?.testId
                          ? "did match"
                          : "did NOT match"
                      }) 
    and type "${context?.type}" (${
                        context?.type == contextType
                          ? "did match"
                          : "did NOT match"
                      })`
                  );
                }
              } else {
                console.log(
                  Date.now() +
                    ` Received "${contextType}" (from current context) for an unspecified test`
                );
                if (executionListener) executionListener.unsubscribe();
                resolve(context);
              }
            }
          };
          channel.getCurrentContext().then(ccHandler);
        }
      });
    };
  });

export type ChannelsAppContext = Context & {
  commands: string[];
  config: {
    testId: string;
    notifyAppAOnCompletion: boolean;
    historyItems: number;
    fdc3ApiVersion: string;
  };
};

export type ChannelsAppConfig = {
  fdc3ApiVersion: string;
  testId: string;
  notifyAppAOnCompletion?: boolean;
  historyItems?: number;
  userChannelId?: string;
};

function buildChannelsAppContext(
  mockAppCommands: string[],
  config: ChannelsAppConfig
): ChannelsAppContext {
  return {
    type: "channelsAppContext",
    commands: mockAppCommands,
    config: {
      fdc3ApiVersion: config.fdc3ApiVersion,
      testId: config.testId,
      notifyAppAOnCompletion: config.notifyAppAOnCompletion ?? false,
      historyItems: config.historyItems ?? 1,
    },
  };
}

const commands = {
  joinUserChannelOne: "joinUserChannelOne",
  retrieveTestAppChannel: "retrieveTestAppChannel",
  broadcastInstrumentContext: "broadcastInstrumentContext",
  broadcastContactContext: "broadcastContactContext",
};
