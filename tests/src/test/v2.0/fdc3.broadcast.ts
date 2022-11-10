import { Listener, Channel, Context } from "fdc3_2_0";
import { assert, expect } from "chai";
import constants from "../../constants";
import APIDocumentation from "../../apiDocuments";
import { DesktopAgent } from "fdc3_2_0/dist/api/DesktopAgent";


const documentation =
  "\r\nDocumentation: " + APIDocumentation.desktopAgent + "\r\nCause:";
let timeout: number;

interface AppControlContext extends Context {
  testId: string;
}

export default () =>
  describe("fdc3.broadcast", () => {
    let listener: Listener;
    let listener2: Listener;
    let executionListener: Listener;

    it("Broadcast method is callable", async () => {
      await (<DesktopAgent>(<unknown>window.fdc3)).broadcast({
        type: "fdc3.instrument",
        id: { ticker: "AAPL" },
      });
    });

    describe("System channels", () => {
      beforeEach(async () => {
        await unsubscribeListeners();
        await (<DesktopAgent>(<unknown>window.fdc3)).leaveCurrentChannel();
      });

      afterEach(async function afterEach() {
        await closeChannelsAppWindow(this.currentTest.title);
      });

      const scTestId1 =
        "Should receive context when adding a listener then joining a user channel before app B broadcasts context to the same channel";
      it(scTestId1, async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- Add fdc3.instrument context listener to app A\r\n- App A joins channel 1\r\n- App B joins channel 1\r\n- App B broadcasts fdc3.instrument context${documentation}`;

        return new Promise(async (resolve, reject) => {
          //Listen for when ChannelsApp execution is complete
          const resolveExecutionCompleteListener = waitForContext(
            "executionComplete",
            scTestId1,
            await (<DesktopAgent>(<unknown>window.fdc3)).getOrCreateChannel(
              "app-control"
            )
          );

          //Add context listener
          listener = await (<DesktopAgent>(
            (<unknown>window.fdc3)
          )).addContextListener(null, async (context) => {
            expect(context.type).to.be.equals("fdc3.instrument", errorMessage);
            resolve();
            return;
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
          await (<DesktopAgent>(<unknown>window.fdc3)).open(
            { appId: "ChannelsAppId" },
            buildChannelsAppContext(channelsAppCommands, channelsAppConfig)
          );

          //wait for ChannelsApp to execute
          await resolveExecutionCompleteListener;

          //reject if no context received
          reject(new Error(`${errorMessage} No context received`));
          return;
        });
      });

      const scTestId2 =
        "Should receive context when joining a user channel then adding a context listener before app B broadcasts context to the same channel";
      it(scTestId2, async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- App A joins channel 1\r\n- Add listener of type fdc3.instrument to App A\r\n- App B joins channel 1\r\n- App B broadcasts fdc3.instrument context${documentation}`;

        return new Promise(async (resolve, reject) => {
          //Listen for when ChannelsApp execution is complete
          const resolveExecutionCompleteListener = waitForContext(
            "executionComplete",
            scTestId2,
            await (<DesktopAgent>(<unknown>window.fdc3)).getOrCreateChannel(
              "app-control"
            )
          );

          //Join user channel 1
          await joinChannel(1);

          //Add fdc3.instrument context listener
          listener = await (<DesktopAgent>(
            (<unknown>window.fdc3)
          )).addContextListener(null, async (context) => {
            expect(context.type).to.be.equals("fdc3.instrument", errorMessage);
            resolve();
            return;
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
          await (<DesktopAgent>(<unknown>window.fdc3)).open(
            { appId: "ChannelsAppId" },
            buildChannelsAppContext(channelsAppCommands, channelsAppConfig)
          );

          //wait for ChannelsApp to execute
          await resolveExecutionCompleteListener;

          //Reject if no context received
          reject(new Error(`${errorMessage} No context received`));
          return;
        });
      });

      const scTestId3 =
        "Should receive context when app B joins then broadcasts context to a user channel before A joins and listens on the same channel";
      it(scTestId3, async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- App B joins channel 1\r\n- App B broadcasts fdc3.instrument context\r\n- App A joins channel 1\r\n- App A adds fdc3.instrument context listener${documentation}`;

        return new Promise(async (resolve, reject) => {
          //Listen for when ChannelsApp execution is complete
          const resolveExecutionCompleteListener = waitForContext(
            "executionComplete",
            scTestId3,
            await (<DesktopAgent>(<unknown>window.fdc3)).getOrCreateChannel(
              "app-control"
            )
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
          await (<DesktopAgent>(<unknown>window.fdc3)).open(
            { appId: "ChannelsAppId" },
            buildChannelsAppContext(channelsAppCommands, channelsAppConfig)
          );

          //Join user channel 1
          await joinChannel(1);

          //Add fdc3.instrument context listener
          listener = await (<DesktopAgent>(
            (<unknown>window.fdc3)
          )).addContextListener(null, async (context) => {
            expect(context.type).to.be.equals("fdc3.instrument", errorMessage);
            resolve();
            return;
          });

          validateListenerObject(listener);

          //Wait for ChannelsApp to execute
          await resolveExecutionCompleteListener;

          //Reject if no context received
          reject(new Error(`${errorMessage} No context received`));
          return;
        });
      });

      const scTestId4 =
        "Should receive context when app B broadcasts the listened type to the same user channel";
      it(scTestId4, async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- App A adds fdc3.instrument context listener\r\n- App A joins channel 1\r\n- App B joins channel 1\r\n- App B broadcasts context of type fdc3.instrument${documentation}`;

        return new Promise(async (resolve, reject) => {
          //Listen for when ChannelsApp execution is complete
          const resolveExecutionCompleteListener = waitForContext(
            "executionComplete",
            scTestId4,
            await (<DesktopAgent>(<unknown>window.fdc3)).getOrCreateChannel(
              "app-control"
            )
          );

          //Add context listener
          listener = await (<DesktopAgent>(
            (<unknown>window.fdc3)
          )).addContextListener("fdc3.instrument", (context) => {
            expect(context.type).to.be.equals("fdc3.instrument", errorMessage);
            resolve();
            return;
          });

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
          await (<DesktopAgent>(<unknown>window.fdc3)).open(
            { appId: "ChannelsAppId" },
            buildChannelsAppContext(channelsAppCommands, channelsAppConfig)
          );

          //Wait for ChannelsApp to execute
          await resolveExecutionCompleteListener;

          //Reject if no context received
          reject(new Error(`${errorMessage} No context received`));
          return;
        });
      });

      const scTestId5 =
        "Should receive context when app B broadcasts the listened type to the same user channel";
      it(scTestId5, async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- App A joins channel 1\r\n- App A adds fdc3.instrument context listener\r\n- App B joins channel 1\r\n- App B broadcasts context of type fdc3.instrument${documentation}`;

        return new Promise(async (resolve, reject) => {
          //Listen for when ChannelsApp execution is complete
          const resolveExecutionCompleteListener = waitForContext(
            "executionComplete",
            scTestId5,
            await (<DesktopAgent>(<unknown>window.fdc3)).getOrCreateChannel(
              "app-control"
            )
          );

          //Join user channel 1
          joinChannel(1);

          //Add context listener
          listener = await (<DesktopAgent>(
            (<unknown>window.fdc3)
          )).addContextListener("fdc3.instrument", (context) => {
            expect(context.type).to.be.equals("fdc3.instrument", errorMessage);
            resolve();
            return;
          });

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
          await (<DesktopAgent>(<unknown>window.fdc3)).open(
            { appId: "ChannelsAppId" },
            buildChannelsAppContext(channelsAppCommands, channelsAppConfig)
          );

          //Wait for ChannelsApp to execute
          await resolveExecutionCompleteListener;

          //Reject if no context received
          reject(new Error(`${errorMessage} No context received`));
          return;
        });
      });

      const scTestId6 =
        "Should receive context when app B broadcasts the listened type to the same user channel";
      it(scTestId6, async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- App A adds fdc3.instrument context listener\r\n- App A joins channel 1\r\n- App B joins channel 1\r\n- App B broadcasts context of type fdc3.instrument${documentation}`;

        return new Promise(async (resolve, reject) => {
          //Listen for when ChannelsApp execution is complete
          const resolveExecutionCompleteListener = waitForContext(
            "executionComplete",
            scTestId6,
            await (<DesktopAgent>(<unknown>window.fdc3)).getOrCreateChannel(
              "app-control"
            )
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
          await (<DesktopAgent>(<unknown>window.fdc3)).open(
            { appId: "ChannelsAppId" },
            buildChannelsAppContext(channelsAppCommands, channelsAppConfig)
          );

          //Wait for ChannelsApp to execute
          await resolveExecutionCompleteListener;

          //Add context listener
          listener = await (<DesktopAgent>(
            (<unknown>window.fdc3)
          )).addContextListener("fdc3.instrument", (context) => {
            expect(context.type).to.be.equals("fdc3.instrument", errorMessage);
            resolve();
            return;
          });

          validateListenerObject(listener);

          //Join user channel 1
          joinChannel(1);

          //Reject if no context received
          reject(new Error(`${errorMessage} No context received`));
          return;
        });
      });

      const scTestId7 =
        "Should receive context when app B broadcasts the listened type to the same user channel";
      it(scTestId7, async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- App A joins channel 1\r\n- App A adds fdc3.instrument context listener\r\n- App B joins channel 1\r\n- App B broadcasts context of type fdc3.instrument${documentation}`;

        return new Promise(async (resolve, reject) => {
          //Listen for when ChannelsApp execution is complete
          const resolveExecutionCompleteListener = waitForContext(
            "executionComplete",
            scTestId7,
            await (<DesktopAgent>(<unknown>window.fdc3)).getOrCreateChannel(
              "app-control"
            )
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
          await (<DesktopAgent>(<unknown>window.fdc3)).open(
            { appId: "ChannelsAppId" },
            buildChannelsAppContext(channelsAppCommands, channelsAppConfig)
          );

          //Wait for ChannelsApp to execute
          await resolveExecutionCompleteListener;

          //Join user channel 1
          joinChannel(1);

          //Add context listener
          listener = await (<DesktopAgent>(
            (<unknown>window.fdc3)
          )).addContextListener("fdc3.instrument", (context) => {
            expect(context.type).to.be.equals("fdc3.instrument", errorMessage);
            resolve();
            return;
          });

          validateListenerObject(listener);

          //Reject if no context received
          reject(new Error(`${errorMessage} No context received`));
          return;
        });
      });

      const scTestId8 =
        "Should receive multiple contexts when app B broadcasts the listened types to the same user channel";
      it(scTestId7, async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- App A adds fdc3.instrument and fdc3.contact context listener\r\n- App A joins channel 1\r\n- App B joins channel 1\r\n- App B broadcasts both context types${documentation}`;

        return new Promise(async (resolve, reject) => {
          //Listen for when ChannelsApp execution is complete
          const resolveExecutionCompleteListener = waitForContext(
            "executionComplete",
            scTestId8,
            await (<DesktopAgent>(<unknown>window.fdc3)).getOrCreateChannel(
              "app-control"
            )
          );
          let contextTypes: string[] = [];

          function checkIfBothContextsReceived() {
            if (contextTypes.length === 2) {
              if (
                !contextTypes.includes("fdc3.contact") ||
                !contextTypes.includes("fdc3.instrument")
              ) {
                assert.fail("Incorrect context received", errorMessage);
              } else {
                resolve();
                return;
              }
            }
          }

          //Add context listener
          listener = await (<DesktopAgent>(
            (<unknown>window.fdc3)
          )).addContextListener("fdc3.instrument", (context) => {
            contextTypes.push(context.type);
            checkIfBothContextsReceived();
          });

          validateListenerObject(listener);

          //Add second context listener to app A
          listener2 = await (<DesktopAgent>(
            (<unknown>window.fdc3)
          )).addContextListener("fdc3.contact", (context) => {
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
          await (<DesktopAgent>(<unknown>window.fdc3)).open(
            { appId: "ChannelsAppId" },
            buildChannelsAppContext(channelsAppCommands, channelsAppConfig)
          );

          //Wait for ChannelsApp to execute
          await resolveExecutionCompleteListener;

          //Reject if no context received
          reject(
            new Error(`${errorMessage} At least one context was not received`)
          );
          return;
        });
      });

      const scTestId9 =
        "Should not receive context when A & B join different user channels and app B broadcasts a listened type";
      it(scTestId9, async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- App A adds fdc3.instrument and fdc3.contact context listener\r\n- App A joins channel 2\r\n- App B joins channel 1\r\n- App B broadcasts both context types${documentation}`;

        return new Promise(async (resolve, reject) => {
          //Add fdc3.instrument context listener
          listener = await (<DesktopAgent>(
            (<unknown>window.fdc3)
          )).addContextListener("fdc3.instrument", (context) => {
            reject(
              new Error(`${errorMessage} ${context.type} context received`)
            );
            clearTimeout(timeout);
            return;
          });

          validateListenerObject(listener);

          //Add fdc3.contact context listener
          listener2 = await (<DesktopAgent>(
            (<unknown>window.fdc3)
          )).addContextListener("fdc3.contact", (context) => {
            reject(
              new Error(`${errorMessage} ${context.type} context received`)
            );
            clearTimeout(timeout);
            return;
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
          await (<DesktopAgent>(<unknown>window.fdc3)).open(
            { appId: "ChannelsAppId" },
            buildChannelsAppContext(channelsAppCommands, channelsAppConfig)
          );

          //Give listener time to receive context
          await wait();
          resolve();
          return;
        });
      });

      const scTestId10 =
        "Should not receive context when unsubscribing a user channel before app B broadcasts the listened type to that channel";
      it(scTestId10, async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- App A adds context listener of type fdc3.instrument\r\n- App A joins channel 1\r\n- App A unsubscribes the listener\r\n- App B joins channel 1\r\n- App B broadcasts context of type fdc3.instrument${documentation}`;

        return new Promise(async (resolve, reject) => {
          //Listen for when ChannelsApp execution is complete
          const resolveExecutionCompleteListener = waitForContext(
            "executionComplete",
            scTestId10,
            await (<DesktopAgent>(<unknown>window.fdc3)).getOrCreateChannel(
              "app-control"
            )
          );

          //Add fdc3.instrument context listener
          listener = await (<DesktopAgent>(
            (<unknown>window.fdc3)
          )).addContextListener("fdc3.instrument", (context) => {
            reject(
              new Error(`${errorMessage} ${context.type} context received`)
            );
            return;
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
          await (<DesktopAgent>(<unknown>window.fdc3)).open(
            { appId: "ChannelsAppId" },
            buildChannelsAppContext(channelsAppCommands, channelsAppConfig)
          );

          //Wait for ChannelsApp to execute
          await resolveExecutionCompleteListener;
          resolve();
          return;
        });
      });

      const scTestId11 =
        "Should not receive context when joining two different user channels before app B broadcasts the listened type to the first channel that was joined";
      it(scTestId11, async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- App A adds context listener of type fdc3.instrument\r\n- App A joins channel 1\r\n- App A joins channel 2\r\n- App B joins channel 1\r\n- App B broadcasts context of type fdc3.instrument${documentation}`;

        return new Promise(async (resolve, reject) => {
          //Add fdc3.instrument context listener
          listener = await (<DesktopAgent>(
            (<unknown>window.fdc3)
          )).addContextListener("fdc3.instrument", async (context) => {
            reject(
              new Error(`${errorMessage} ${context.type} context received`)
            );
            clearTimeout(timeout);
            return;
          });

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
          await (<DesktopAgent>(<unknown>window.fdc3)).open(
            { appId: "ChannelsAppId" },
            buildChannelsAppContext(channelsAppCommands, channelsAppConfig)
          );

          //Give listener time to receive context
          await wait();
          resolve();
          return;
        });
      });

      const scTestId12 =
        "Should not receive context when joining and then leaving a user channel before app B broadcasts the listened type to the same channel";
      it(scTestId12, async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- App A adds context listener of type fdc3.instrument\r\n- App A joins channel 1\r\n- App A leaves channel 1\r\n- App B joins channel 1\r\n- App B broadcasts context of type fdc3.instrument${documentation}`;

        return new Promise(async (resolve, reject) => {
          //Add a context listeners to app A
          listener = await (<DesktopAgent>(
            (<unknown>window.fdc3)
          )).addContextListener("fdc3.instrument", (context) => {
            reject(
              new Error(`${errorMessage} ${context.type} context received`)
            );
            clearTimeout(timeout);
            return;
          });

          validateListenerObject(listener);

          //Join user channel 1
          await joinChannel(1);

          //App A leaves channel 1
          await (<DesktopAgent>(<unknown>window.fdc3)).leaveCurrentChannel();

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
          await (<DesktopAgent>(<unknown>window.fdc3)).open(
            { appId: "ChannelsAppId" },
            buildChannelsAppContext(channelsAppCommands, channelsAppConfig)
          );

          //Give listener time to receive context
          await wait();
          resolve();
          return;
        });
      });

      const scTestId13 =
        "The channel returned when running getCurrentChannel() should match the joined channel";
      it(scTestId13, async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- App A gets user channels\r\n- App A joins user channel 3\r\n- App A gets current channel${documentation}`;

        //Join user channel 1
        await joinChannel(3);
        const joinedChannel = await (<DesktopAgent>(
          (<unknown>window.fdc3)
        )).getCurrentChannel();
        expect(joinedChannel.id).to.be.equals("3", errorMessage);
      });

      const scTestId14 =
        "getCurrentChannel() should return null if no channel has been joined";
      it(scTestId14, async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- App A runs getCurrentChannel()${documentation}`;

        const joinedChannel = await (<DesktopAgent>(
          (<unknown>window.fdc3)
        )).getCurrentChannel();
        expect(joinedChannel).to.be.equals(null, errorMessage);
      });
    });

    describe("App channels", () => {
      beforeEach(async () => {
        await unsubscribeListeners();
        await (<DesktopAgent>(<unknown>window.fdc3)).leaveCurrentChannel();
      });

      afterEach(async function afterEach() {
        await closeChannelsAppWindow(this.currentTest.title);
      });

      const acTestId =
        "Should receive context when app a adds a listener and app B broadcasts to the same app channel";
      it(acTestId, async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- App A retrieves an app channel\r\n- App A adds adds a context listener of type null\r\n- App B retrieves the same app channel as A\r\n- App B broadcasts context of type fdc3.instrument${documentation}`;

        return new Promise(async (resolve, reject) => {
          //Listen for when ChannelsApp execution is complete
          const resolveExecutionCompleteListener = waitForContext(
            "executionComplete",
            acTestId,
            await (<DesktopAgent>(<unknown>window.fdc3)).getOrCreateChannel(
              "app-control"
            )
          );

          //Retrieve an app channel
          const testChannel = await (<DesktopAgent>(
            (<unknown>window.fdc3)
          )).getOrCreateChannel("test-channel");

          //Add context listener
          listener = await testChannel.addContextListener(
            null,
            async (context) => {
              expect(context.type).to.be.equals(
                "fdc3.instrument",
                errorMessage
              );
              resolve();
              return;
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
          await (<DesktopAgent>(<unknown>window.fdc3)).open(
            { appId: "ChannelsAppId" },
            buildChannelsAppContext(channelsAppCommands, channelsAppConfig)
          );

          //Wait for ChannelsApp to execute
          await resolveExecutionCompleteListener;

          //Reject if no context received
          reject(new Error(`${errorMessage} No context received`));
          return;
        });
      });

      const acTestId2 =
        "Should receive context when app B broadcasts context to an app channel before A retrieves current context";
      it(acTestId2, async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- App A & B retrieve the same app channel\r\n- App B broadcasts context of type fdc3.instrument\r\n- App A retrieves current context of type null${documentation}`;

        return new Promise(async (resolve, reject) => {
          //Listen for when ChannelsApp execution is complete
          const resolveExecutionCompleteListener = waitForContext(
            "executionComplete",
            acTestId2,
            await (<DesktopAgent>(<unknown>window.fdc3)).getOrCreateChannel(
              "app-control"
            )
          );

          //Retrieve an app channel
          const testChannel = await (<DesktopAgent>(
            (<unknown>window.fdc3)
          )).getOrCreateChannel("test-channel");

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
          await (<DesktopAgent>(<unknown>window.fdc3)).open(
            { appId: "ChannelsAppId" },
            buildChannelsAppContext(channelsAppCommands, channelsAppConfig)
          );

          //Retrieve current context from channel
          await testChannel.getCurrentContext().then(async (context) => {
            expect(context.type).to.be.equals("fdc3.instrument", errorMessage);
            resolve();
            return;
          });

          //Wait for ChannelsApp the finish executing
          await resolveExecutionCompleteListener;

          reject(new Error(`${errorMessage} No context received`));
          return;
        });
      });

      const acTestId3 =
        "Should receive context of correct type when app B broadcasts multiple contexts to an app channel before A retrieves current context of a specified type";
      it(acTestId3, async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- App A & B retrieve the same app channel\r\n- App B broadcasts context of type fdc3.instrument and then of type fdc3.contact\r\n- App A retreives current context of type fdc3.instrument${documentation}`;

        return new Promise(async (resolve, reject) => {
          //Listen for when AppChannel execution is complete
          const resolveExecutionCompleteListener = waitForContext(
            "executionComplete",
            acTestId3,
            await (<DesktopAgent>(<unknown>window.fdc3)).getOrCreateChannel(
              "app-control"
            )
          );

          //Retrieve an app channel
          const testChannel = await (<DesktopAgent>(
            (<unknown>window.fdc3)
          )).getOrCreateChannel("test-channel");

          const channelsAppCommands = [
            commands.retrieveTestAppChannel,
            commands.broadcastInstrumentContext,
            commands.broadcastContactContext,
          ];

          const channelsAppConfig: ChannelsAppConfig = {
            fdc3ApiVersion: "2.0",
            testId: acTestId3,
            notifyAppAOnCompletion: true,
          };

          //Open ChannelsApp then execute commands in order
          await (<DesktopAgent>(<unknown>window.fdc3)).open(
            { appId: "ChannelsAppId" },
            buildChannelsAppContext(channelsAppCommands, channelsAppConfig)
          );

          await resolveExecutionCompleteListener;

          //Retrieve current context from channel
          await testChannel
            .getCurrentContext("fdc3.instrument")
            .then((context) => {
              expect(context.type).to.be.equals(
                "fdc3.instrument",
                errorMessage
              );
              resolve();
              return;
            });

          reject(new Error(`${errorMessage} No context received`));
          resolve();
          return;
        });
      });

      const acTestId4 =
        "Should only receive the listened context when app B broadcasts multiple contexts to the same app channel";
      it(acTestId4, async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- App A retrieves an app channel\r\n- App A adds a context listener of type fdc3.instrument\r\n- App B retrieves the same app channel as A\r\n- App B broadcasts a context of type fdc3.instrument and fdc3.contact${documentation}`;

        return new Promise(async (resolve, reject) => {
          //Listen for when ChannelsApp execution is complete
          const resolveExecutionCompleteListener = waitForContext(
            "executionComplete",
            acTestId4,
            await (<DesktopAgent>(<unknown>window.fdc3)).getOrCreateChannel(
              "app-control"
            )
          );

          //Retrieve an app channel
          const testChannel = await (<DesktopAgent>(
            (<unknown>window.fdc3)
          )).getOrCreateChannel("test-channel");

          //Add context listener
          listener = await testChannel.addContextListener(
            "fdc3.instrument",
            (context) => {
              expect(context.type).to.be.equals(
                "fdc3.instrument",
                errorMessage
              );
              resolve();
              return;
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
          await (<DesktopAgent>(<unknown>window.fdc3)).open(
            { appId: "ChannelsAppId" },
            buildChannelsAppContext(channelsAppCommands, channelsAppConfig)
          );

          //Wait for ChannelsApp to execute
          await resolveExecutionCompleteListener;

          //If no context received throw error
          reject(new Error(`${errorMessage} No context received`));
          return;
        });
      });

      const acTestId5 =
        "Should receive multiple contexts when app B broadcasts the listened types to the same app channel";
      it(acTestId5, async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- App A retrieves an app channel\r\n- App A adds a context listener of type fdc3.instrument and fdc3.contact\r\n- App B retrieves the same app channel as A\r\n- App B broadcasts a context of type fdc3.instrument and fdc3.contact${documentation}`;

        return new Promise(async (resolve, reject) => {
          let contextTypes: string[] = [];
          //Retrieve an app channel
          const testChannel = await (<DesktopAgent>(
            (<unknown>window.fdc3)
          )).getOrCreateChannel("test-channel");

          //Listen for when ChannelsApp execution is complete
          const resolveExecutionCompleteListener = waitForContext(
            "executionComplete",
            acTestId5,
            await (<DesktopAgent>(<unknown>window.fdc3)).getOrCreateChannel(
              "app-control"
            )
          );

          //Add fdc3.instrument context listener
          listener = await testChannel.addContextListener(
            "fdc3.instrument",
            (context) => {
              contextTypes.push(context.type);
              checkIfBothContextsReceived();
            }
          );

          validateListenerObject(listener);

          //Add fdc3.contact context listener
          listener2 = await testChannel.addContextListener(
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
            fdc3ApiVersion: "2.0",
            testId: acTestId5,
            notifyAppAOnCompletion: true,
          };

          //Open ChannelsApp then execute commands in order
          await (<DesktopAgent>(<unknown>window.fdc3)).open(
            { appId: "ChannelsAppId" },
            buildChannelsAppContext(channelsAppCommands, channelsAppConfig)
          );

          function checkIfBothContextsReceived() {
            if (contextTypes.length === 2) {
              if (
                !contextTypes.includes("fdc3.contact") ||
                !contextTypes.includes("fdc3.instrument")
              ) {
                assert.fail("Incorrect context received", errorMessage);
              } else {
                resolve();
                return;
              }
            }
          }

          //Wait for ChannelsApp to execute
          await resolveExecutionCompleteListener;

          //If no context received throw error
          reject(new Error(`${errorMessage} No context received`));
          return;
        });
      });

      const acTestId6 =
        "Should not receive context when unsubscribing an app channel before app B broadcasts to that channel";
      it(acTestId6, async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- App A retrieves an app channel\r\n- App A adds a context listener of type null\r\n- App A unsubscribes the app channel\r\n- App B retrieves the same app channel\r\n- App B broadcasts a context of type fdc3.instrument and fdc3.contact${documentation}`;

        return new Promise(async (resolve, reject) => {
          //Retrieve an app channel
          const testChannel = await (<DesktopAgent>(
            (<unknown>window.fdc3)
          )).getOrCreateChannel("test-channel");

          //Listen for when ChannelsApp execution is complete
          const resolveExecutionCompleteListener = waitForContext(
            "executionComplete",
            acTestId6,
            await (<DesktopAgent>(<unknown>window.fdc3)).getOrCreateChannel(
              "app-control"
            )
          );

          //Add context listener
          listener = await testChannel.addContextListener(null, (context) => {
            reject(
              new Error(`${errorMessage} ${context.type} context received`)
            );
            return;
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
          await (<DesktopAgent>(<unknown>window.fdc3)).open(
            { appId: "ChannelsAppId" },
            buildChannelsAppContext(channelsAppCommands, channelsAppConfig)
          );

          //Wait for ChannelsApp to execute
          await resolveExecutionCompleteListener;
          resolve();
          return;
        });
      });

      const acTestId7 =
        "Should not receive context when app B broadcasts context to a different app channel";
      it(acTestId7, async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- App A retrieves an app channel\r\n- App A adds a context listener of type fdc3.instrument\r\n- App B retrieves a different app channel\r\n- App B broadcasts a context of type fdc3.instrument${documentation}`;

        return new Promise(async (resolve, reject) => {
          //Retrieve an app channel
          const testChannel = await (<DesktopAgent>(
            (<unknown>window.fdc3)
          )).getOrCreateChannel("a-different-test-channel");

          //Add context listener
          listener = await testChannel.addContextListener(
            "fdc3.instrument",
            (context) => {
              reject(
                new Error(`${errorMessage} ${context.type} context received`)
              );
              clearTimeout(timeout);
              return;
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
          await (<DesktopAgent>(<unknown>window.fdc3)).open(
            { appId: "ChannelsAppId" },
            buildChannelsAppContext(channelsAppCommands, channelsAppConfig)
          );

          //Give listener time to receive context
          await wait();
          resolve();
          return;
        });
      });

      const acTestId8 =
        "Should receive context of correct type when app B broadcasts multiple contexts to an app channel before A retrieves current context of a specified type";
      it(acTestId8, async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- App A & B retrieve the same app channel\r\n- App B broadcasts context of type fdc3.instrument and then of type fdc3.contact\r\n- App A retreives current context of type fdc3.instrument${documentation}`;

        return new Promise(async (resolve, reject) => {
          //Listen for when AppChannel execution is complete
          const resolveExecutionCompleteListener = waitForContext(
            "executionComplete",
            acTestId8,
            await (<DesktopAgent>(<unknown>window.fdc3)).getOrCreateChannel(
              "app-control"
            )
          );

          //Retrieve an app channel
          const testChannel = await (<DesktopAgent>(
            (<unknown>window.fdc3)
          )).getOrCreateChannel("test-channel");

          const channelsAppCommands = [
            commands.retrieveTestAppChannel,
            commands.broadcastInstrumentContext,
            commands.broadcastContactContext,
          ];

          const channelsAppConfig: ChannelsAppConfig = {
            fdc3ApiVersion: "2.0",
            testId: acTestId8,
            notifyAppAOnCompletion: true,
          };

          //Open ChannelsApp then execute commands in order
          await (<DesktopAgent>(<unknown>window.fdc3)).open(
            { appId: "ChannelsAppId" },
            buildChannelsAppContext(channelsAppCommands, channelsAppConfig)
          );

          await resolveExecutionCompleteListener;

          //Retrieve current context from channel
          await testChannel
            .getCurrentContext("fdc3.instrument")
            .then((context) => {
              expect(context.type).to.be.equals(
                "fdc3.instrument",
                errorMessage
              );
              resolve();
              return;
            });

          reject(new Error(`${errorMessage} No context received`));
          resolve();
          return;
        });
      });

      const acTestId9 =
        "Should still receive context when listening on one channel and then retrieving a different app channel, before app B broadcasts to the first channel that was retrieved by A";
      it(acTestId9, async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- App A retrieves an app channel\r\n- App A adds a context listener of type fdc3.instrument\r\n\r\n- App A retrieves different app channel\r\n- App A adds a context listener of type fdc3.instrument to the second channel that was retrieved\r\n- App B retrieves the first app channel that A retrieved\r\n- App B broadcasts a context of type fdc3.instrument and fdc3.contact${documentation}`;

        return new Promise(async (resolve, reject) => {
          //Listen for when ChannelsApp execution is complete
          const resolveExecutionCompleteListener = waitForContext(
            "executionComplete",
            acTestId9,
            await (<DesktopAgent>(<unknown>window.fdc3)).getOrCreateChannel(
              "app-control"
            )
          );

          //Retrieve an app channel
          const testChannel = await (<DesktopAgent>(
            (<unknown>window.fdc3)
          )).getOrCreateChannel("test-channel");

          //Add context listener
          listener = await testChannel.addContextListener(
            "fdc3.instrument",
            (context) => {
              expect(context.type).to.be.equals(
                "fdc3.instrument",
                errorMessage
              );
              resolve();
              return;
            }
          );

          //Retrieve a second app channel
          const anotherTestChannel = await (<DesktopAgent>(
            (<unknown>window.fdc3)
          )).getOrCreateChannel("another-test-channel");

          //Add a context listener to the second app channel that was retrieved
          listener2 = await anotherTestChannel.addContextListener(
            "fdc3.instrument",
            (context) => {
              reject(
                new Error(
                  `${errorMessage} fdc3.instrument context received on the second channel that was joined rather than the first`
                )
              );
              return;
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
            testId: acTestId9,
            notifyAppAOnCompletion: true,
          };

          //Open ChannelsApp then execute commands in order
          await (<DesktopAgent>(<unknown>window.fdc3)).open(
            { appId: "ChannelsAppId" },
            buildChannelsAppContext(channelsAppCommands, channelsAppConfig)
          );

          //Wait for ChannelsApp to execute
          await resolveExecutionCompleteListener;

          //If no context received throw error
          reject(new Error(`${errorMessage} No context received`));
          return;
        });
      });

      const acTestId10 =
        "Should not receive context when retrieving two different app channels before app B broadcasts the listened type to the first channel that was retrieved";
      it(acTestId10, async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- App A retrieves an app channel\r\n- App A switches to a different app channel\r\n- App A adds a context listener of type fdc3.instrument\r\n- App B retrieves the first channel that A retrieved\r\n- App B broadcasts a context of type fdc3.instrument${documentation}`;

        return new Promise(async (resolve, reject) => {
          //Retrieve an app channel
          let testChannel = await (<DesktopAgent>(
            (<unknown>window.fdc3)
          )).getOrCreateChannel("test-channel");

          //Listen for when ChannelsApp execution is complete
          const resolveExecutionCompleteListener = waitForContext(
            "executionComplete",
            acTestId10,
            await (<DesktopAgent>(<unknown>window.fdc3)).getOrCreateChannel(
              "app-control"
            )
          );

          //App A retrieves a different app channel
          testChannel = await (<DesktopAgent>(
            (<unknown>window.fdc3)
          )).getOrCreateChannel("a-different-test-channel");

          //Add context listener
          listener = await testChannel.addContextListener(
            "fdc3.instrument",
            (context) => {
              reject(
                new Error(`${errorMessage} ${context.type} context received`)
              );
              return;
            }
          );

          validateListenerObject(listener);

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
          await (<DesktopAgent>(<unknown>window.fdc3)).open(
            { appId: "ChannelsAppId" },
            buildChannelsAppContext(channelsAppCommands, channelsAppConfig)
          );

          //Wait for ChannelsApp to execute
          await resolveExecutionCompleteListener;
          resolve();
          return;
        });
      });

      const acTestId11 =
        "Should receive both contexts when app B broadcasts both contexts to the same app channel and A gets current context for each type";
      it(acTestId11, async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- App A retrieves an app channel\r\n- App B retrieves the same app channel\r\n- App B broadcasts a context of type fdc3.instrument and fdc3.contact\r\n- App A gets current context for types fdc3.instrument and fdc3.contact${documentation}`;

        //Retrieve an app channel
        const testChannel = await (<DesktopAgent>(
          (<unknown>window.fdc3)
        )).getOrCreateChannel("test-channel");

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
        await (<DesktopAgent>(<unknown>window.fdc3)).open(
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
      });

      const acTestId12 =
        "Should receive the last broadcast context when calling getCurrentContext()";
      it(acTestId12, async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- App A retrieves an app channel\r\n- App B retrieves the same app channel\r\n- App B broadcasts a context of type fdc3.instrument and fdc3.contact\r\n- App A gets current context${documentation}`;

        //Retrieve an app channel
        const testChannel = await (<DesktopAgent>(
          (<unknown>window.fdc3)
        )).getOrCreateChannel("test-channel");

        const channelsAppCommands = [
          commands.retrieveTestAppChannel,
          commands.broadcastInstrumentContext,
          commands.broadcastContactContext,
        ];

        const channelsAppConfig: ChannelsAppConfig = {
          fdc3ApiVersion: "2.0",
          testId: acTestId12,
        };

        //Open ChannelsApp then execute commands in order
        await (<DesktopAgent>(<unknown>window.fdc3)).open(
          { appId: "ChannelsApp" },
          buildChannelsAppContext(channelsAppCommands, channelsAppConfig)
        );

        const contactContext = await testChannel.getCurrentContext();
        expect(contactContext.id).to.be.equals("fdc3.contact", errorMessage);
      });

      const acTestId13 =
        "Should retrieve the last broadcast context item when app B broadcasts a context with multiple history items to the same app channel and A gets current context";
      it(acTestId13, async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- App A retrieves an app channel\r\n- App B retrieves the same app channel\r\n- App B broadcasts two different contexts of type fdc3.instrument\r\n- App A gets current context for types fdc3.instrument${documentation}`;

        //Retrieve an app channel
        const testChannel = await (<DesktopAgent>(
          (<unknown>window.fdc3)
        )).getOrCreateChannel("test-channel");

        //Listen for when ChannelsApp execution is complete
        const resolveExecutionCompleteListener = waitForContext(
          "executionComplete",
          acTestId13,
          await (<DesktopAgent>(<unknown>window.fdc3)).getOrCreateChannel(
            "app-control"
          )
        );

        const channelsAppCommands = [
          commands.retrieveTestAppChannel,
          commands.broadcastInstrumentContext,
        ];
        const channelsAppConfig: ChannelsAppConfig = {
          fdc3ApiVersion: "2.0",
          testId: acTestId13,
          notifyAppAOnCompletion: true,
          historyItems: 2,
        };

        //Open ChannelsApp and execute commands in order
        await (<DesktopAgent>(<unknown>window.fdc3)).open(
          { appId: "ChannelsApp" },
          buildChannelsAppContext(channelsAppCommands, channelsAppConfig)
        );

        //Wait for ChannelsApp to execute
        await resolveExecutionCompleteListener;

        //Retrieve fdc3.instrument context
        const context = await testChannel.getCurrentContext("fdc3.instrument");
        expect(context.type).to.be.equals("fdc3.instrument", errorMessage);
        expect(context.name).to.be.equals("History-item-2", errorMessage);
      });

      const acTestId14 =
        "Should retrieve the last broadcast context item when app B broadcasts two different contexts to the same app channel and A gets current context";
      it(acTestId14, async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- App A retrieves an app channel\r\n- App B retrieves the same app channel\r\n- App B broadcasts a context of type fdc3.instrument and fdc3.contact\r\n- App B gets current context with no filter applied${documentation}`;

        //Retrieve an app channel
        const testChannel = await (<DesktopAgent>(
          (<unknown>window.fdc3)
        )).getOrCreateChannel("test-channel");

        //Listen for when ChannelsApp execution is complete
        const resolveExecutionCompleteListener = waitForContext(
          "executionComplete",
          acTestId14,
          await (<DesktopAgent>(<unknown>window.fdc3)).getOrCreateChannel(
            "app-control"
          )
        );

        const channelsAppCommands = [
          commands.retrieveTestAppChannel,
          commands.broadcastInstrumentContext,
          commands.broadcastContactContext,
        ];

        const channelsAppConfig: ChannelsAppConfig = {
          fdc3ApiVersion: "2.0",
          testId: acTestId14,
          notifyAppAOnCompletion: true,
        };

        //Open ChannelsApp then execute commands in order
        await (<DesktopAgent>(<unknown>window.fdc3)).open(
          { appId: "ChannelsApp" },
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

    const joinChannel = async (channel: number) => {
      const channels = await (<DesktopAgent>(
        (<unknown>window.fdc3)
      )).getUserChannels();
      if (channels.length > 0) {
        await (<DesktopAgent>(<unknown>window.fdc3)).joinUserChannel(
          channels[channel - 1].id
        );
      } else {
        assert.fail("No system channels available for app A");
      }
    };

    function validateListenerObject(listenerObject) {
      assert.isObject(listenerObject, "No listener object found");
      expect(typeof listenerObject.unsubscribe).to.be.equals(
        "function",
        "Listener does not contain an unsubscribe method"
      );
    }

    async function wait() {
      return new Promise((resolve) => {
        timeout = window.setTimeout(() => {
          resolve(true);
        }, constants.WaitTime);
      });
    }

    async function closeChannelsAppWindow(testId: string) {
      //Tell ChannelsApp to close window
      const appControlChannel = await broadcastAppChannelCloseWindow(testId);

      //Wait for ChannelsApp to respond
      await waitForContext("windowClosed", testId, appControlChannel);
    }

    const broadcastAppChannelCloseWindow = async (testId: string) => {
      const appControlChannel = await (<DesktopAgent>(
        (<unknown>window.fdc3)
      )).getOrCreateChannel("app-control");
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
    ) => {
      return new Promise<Context>(async (resolve) => {
        console.log(
          `Waiting for type: ${contextType}, on channel: ${channel.id} in test: ${testId}`
        );
        const handler = (context: AppControlContext) => {
          if (testId) {
            if (testId == context.testId) {
              resolve(context);
              if (executionListener) executionListener.unsubscribe();
            } else {
              console.warn(
                `Ignoring ${contextType} context due to mismatched testId (expected: ${testId}, got ${context.testId})`
              );
            }
          } else {
            resolve(context);
            if (executionListener) executionListener.unsubscribe();
          }
        };
        if (channel === undefined) {
          executionListener = await (<DesktopAgent>(
            (<unknown>window.fdc3)
          )).addContextListener(contextType, handler);
        } else {
          executionListener = await channel.addContextListener(
            contextType,
            handler
          );
          //App channels do not auto-broadcast current context when you start listening, so retrieve current context to avoid races
          channel.getCurrentContext(contextType).then(handler);
        }
      });
    };
  });

const commands = {
  joinUserChannelOne: "joinUserChannelOne",
  retrieveTestAppChannel: "retrieveTestAppChannel",
  broadcastInstrumentContext: "broadcastInstrumentContext",
  broadcastContactContext: "broadcastContactContext",
};



type ChannelsAppContext = Context & {
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
};


export function buildChannelsAppContext(
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
