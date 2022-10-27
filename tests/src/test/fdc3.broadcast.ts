import { Listener, Channel, Context, getCurrentChannel } from "@finos/fdc3";
import { assert, expect } from "chai";
import constants from "../constants";
import APIDocumentation from "../apiDocuments";

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

    it("Broadcast method is callable", async () => {
      await window.fdc3.broadcast({
        type: "fdc3.instrument",
        id: { ticker: "AAPL" },
      });
    });

    describe("System channels", () => {
      beforeEach(async () => {
        await unsubscribeListeners();
        await window.fdc3.leaveCurrentChannel();
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
            await window.fdc3.getOrCreateChannel("app-control")
          );

          //Add context listener
          listener = await window.fdc3.addContextListener(
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

          //Join system channel 1
          await joinChannel(1);

          const channelsAppCommands = [
            commands.joinSystemChannelOne,
            commands.broadcastInstrumentContext,
          ];

          //Open ChannelsApp then execute commands in order
          await window.fdc3.open(
            "ChannelsApp",
            buildChannelsAppContext(scTestId1, channelsAppCommands, true)
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
            await window.fdc3.getOrCreateChannel("app-control")
          );

          //Join system channel 1
          await joinChannel(1);

          //Add fdc3.instrument context listener
          listener = await window.fdc3.addContextListener(
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
            commands.joinSystemChannelOne,
            commands.broadcastInstrumentContext,
          ];

          //Open ChannelsApp then execute commands in order
          await window.fdc3.open(
            "ChannelsApp",
            buildChannelsAppContext(scTestId2, channelsAppCommands, true)
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
            await window.fdc3.getOrCreateChannel("app-control")
          );

          const channelsAppCommands = [
            commands.joinSystemChannelOne,
            commands.broadcastInstrumentContext,
          ];

          //Open ChannelsApp then execute commands in order
          await window.fdc3.open(
            "ChannelsApp",
            buildChannelsAppContext(scTestId3, channelsAppCommands, true)
          );

          //Join system channel 1
          await joinChannel(1);

          //Add fdc3.instrument context listener
          listener = await window.fdc3.addContextListener(
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
            await window.fdc3.getOrCreateChannel("app-control")
          );

          //Add context listener
          listener = await window.fdc3.addContextListener(
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

          //Join system channel 1
          joinChannel(1);

          const channelsAppCommands = [
            commands.joinSystemChannelOne,
            commands.broadcastInstrumentContext,
            commands.broadcastContactContext,
          ];

          //Open ChannelsApp then execute commands in order
          await window.fdc3.open(
            "ChannelsApp",
            buildChannelsAppContext(scTestId4, channelsAppCommands, true)
          );

          //Wait for ChannelsApp to execute
          await resolveExecutionCompleteListener;

          //Reject if no context received
          reject(new Error(`${errorMessage} No context received`));
          return;
        });
      });

      const scTestId5 =
        "Should receive multiple contexts when app B broadcasts the listened types to the same user channel";
      it(scTestId5, async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- App A adds fdc3.instrument and fdc3.contact context listener\r\n- App A joins channel 1\r\n- App B joins channel 1\r\n- App B broadcasts both context types${documentation}`;

        return new Promise(async (resolve, reject) => {
          //Listen for when ChannelsApp execution is complete
          const resolveExecutionCompleteListener = waitForContext(
            "executionComplete",
            scTestId5,
            await window.fdc3.getOrCreateChannel("app-control")
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
          listener = await window.fdc3.addContextListener(
            "fdc3.instrument",
            (context) => {
              contextTypes.push(context.type);
              checkIfBothContextsReceived();
            }
          );

          validateListenerObject(listener);

          //Add second context listener to app A
          listener2 = await window.fdc3.addContextListener(
            "fdc3.contact",
            (context) => {
              contextTypes.push(context.type);
              checkIfBothContextsReceived();
            }
          );

          validateListenerObject(listener2);

          //Join system channel 1
          await joinChannel(1);

          const channelsAppCommands = [
            commands.joinSystemChannelOne,
            commands.broadcastInstrumentContext,
            commands.broadcastContactContext,
          ];

          //Open ChannelsApp then execute commands in order
          await window.fdc3.open(
            "ChannelsApp",
            buildChannelsAppContext(scTestId5, channelsAppCommands, true)
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

      const scTestId6 =
        "Should not receive context when A & B join different user channels and app B broadcasts a listened type";
      it(scTestId6, async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- App A adds fdc3.instrument and fdc3.contact context listener\r\n- App A joins channel 2\r\n- App B joins channel 1\r\n- App B broadcasts both context types${documentation}`;

        return new Promise(async (resolve, reject) => {
          //Add fdc3.instrument context listener
          listener = window.fdc3.addContextListener(
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

          //Add fdc3.contact context listener
          listener2 = window.fdc3.addContextListener(
            "fdc3.contact",
            (context) => {
              reject(
                new Error(`${errorMessage} ${context.type} context received`)
              );
              clearTimeout(timeout);
              return;
            }
          );

          validateListenerObject(listener2);

          //ChannelsApp joins channel 2
          await joinChannel(2);

          const channelsAppCommands = [
            commands.joinSystemChannelOne,
            commands.broadcastInstrumentContext,
            commands.broadcastContactContext,
          ];

          //Open ChannelsApp then execute commands in order
          await window.fdc3.open(
            "ChannelsApp",
            buildChannelsAppContext(scTestId6, channelsAppCommands)
          );

          //Give listener time to receive context
          await wait();
          resolve();
          return;
        });
      });

      const scTestId7 =
        "Should not receive context when unsubscribing a user channel before app B broadcasts the listened type to that channel";
      it(scTestId7, async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- App A adds context listener of type fdc3.instrument\r\n- App A joins channel 1\r\n- App A unsubscribes the listener\r\n- App B joins channel 1\r\n- App B broadcasts context of type fdc3.instrument${documentation}`;

        return new Promise(async (resolve, reject) => {
          //Listen for when ChannelsApp execution is complete
          const resolveExecutionCompleteListener = waitForContext(
            "executionComplete",
            scTestId7,
            await window.fdc3.getOrCreateChannel("app-control")
          );

          //Add fdc3.instrument context listener
          listener = window.fdc3.addContextListener(
            "fdc3.instrument",
            (context) => {
              reject(
                new Error(`${errorMessage} ${context.type} context received`)
              );
              return;
            }
          );

          validateListenerObject(listener);

          //Join system channel 1
          await joinChannel(1);

          //Unsubscribe from listeners
          if (listener !== undefined) {
            await listener.unsubscribe();
            listener = undefined;
          } else {
            assert.fail("Listener undefined", errorMessage);
          }

          const channelsAppCommands = [
            commands.joinSystemChannelOne,
            commands.broadcastInstrumentContext,
          ];

          //Open ChannelsApp then execute commands in order
          await window.fdc3.open(
            "ChannelsApp",
            buildChannelsAppContext(scTestId7, channelsAppCommands, true)
          );

          //Wait for ChannelsApp to execute
          await resolveExecutionCompleteListener;
          resolve();
          return;
        });
      });

      const scTestId8 =
        "Should not receive context when joining two different user channels before app B broadcasts the listened type to the first channel that was joined";
      it(scTestId8, async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- App A adds context listener of type fdc3.instrument\r\n- App A joins channel 1\r\n- App A joins channel 2\r\n- App B joins channel 1\r\n- App B broadcasts context of type fdc3.instrument${documentation}`;

        return new Promise(async (resolve, reject) => {
          //Add fdc3.instrument context listener
          listener = window.fdc3.addContextListener(
            "fdc3.instrument",
            async (context) => {
              reject(
                new Error(`${errorMessage} ${context.type} context received`)
              );
              clearTimeout(timeout);
              return;
            }
          );

          //ChannelsApp joins a channel and then joins another
          await joinChannel(1);
          await joinChannel(2);

          const channelsAppCommands = [
            commands.joinSystemChannelOne,
            commands.broadcastInstrumentContext,
          ];

          //Open ChannelsApp then execute commands in order
          await window.fdc3.open(
            "ChannelsApp",
            buildChannelsAppContext(scTestId8, channelsAppCommands)
          );

          //Give listener time to receive context
          await wait();
          resolve();
          return;
        });
      });

      const scTestId9 =
        "Should not receive context when joining and then leaving a user channel before app B broadcasts the listened type to the same channel";
      it(scTestId9, async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- App A adds context listener of type fdc3.instrument\r\n- App A joins channel 1\r\n- App A leaves channel 1\r\n- App B joins channel 1\r\n- App B broadcasts context of type fdc3.instrument${documentation}`;

        return new Promise(async (resolve, reject) => {
          //Add a context listeners to app A
          listener = window.fdc3.addContextListener(
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

          //Join system channel 1
          await joinChannel(1);

          //App A leaves channel 1
          await window.fdc3.leaveCurrentChannel();

          const channelsAppCommands = [
            commands.joinSystemChannelOne,
            commands.broadcastInstrumentContext,
          ];

          //Open ChannelsApp then execute commands in order
          await window.fdc3.open(
            "ChannelsApp",
            buildChannelsAppContext(scTestId9, channelsAppCommands)
          );

          //Give listener time to receive context
          await wait();
          resolve();
          return;
        });
      });
    });

    describe("App channels", () => {
      beforeEach(async () => {
        await unsubscribeListeners();
        await window.fdc3.leaveCurrentChannel();
      });

      afterEach(async function afterEach() {
        await closeChannelsAppWindow(this.currentTest.title);
      });

      const acTestId =
        "Should receive context when app a adds a listener and app B broadcasts to the same app channel";
      it(acTestId, async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- App A retrieves an app channel\r\n- App A adds adds a context listener of type null\r\n- App B retrieves the same app channel as A\r\n- App B broadcasts context of type fdc3.instrument${documentation}`;

        return new Promise(async (resolve, reject) => {
          //Retrieve an app channel
          const testChannel = await window.fdc3.getOrCreateChannel(
            "test-channel"
          );

          //Listen for when ChannelsApp execution is complete
          const resolveExecutionCompleteListener = waitForContext(
            "executionComplete",
            acTestId,
            await window.fdc3.getOrCreateChannel("app-control")
          );

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

          //Open ChannelsApp then execute commands in order
          await window.fdc3.open(
            "ChannelsApp",
            buildChannelsAppContext(acTestId, channelsAppCommands, true)
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
          //Retrieve an app channel
          const testChannel = await window.fdc3.getOrCreateChannel(
            "test-channel"
          );

          //Listen for when ChannelsApp execution is complete
          const resolveExecutionCompleteListener = waitForContext(
            "executionComplete",
            acTestId2,
            await window.fdc3.getOrCreateChannel("app-control")
          );

          const channelsAppCommands = [
            commands.retrieveTestAppChannel,
            commands.broadcastInstrumentContext,
          ];

          //Open ChannelsApp then execute commands in order
          await window.fdc3.open(
            "ChannelsApp",
            buildChannelsAppContext(acTestId2, channelsAppCommands)
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
      it("Should receive context of correct type when app B broadcasts multiple contexts to an app channel before A retrieves current context of a specified type", async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- App A & B retrieve the same app channel\r\n- App B broadcasts context of type fdc3.instrument and then of type fdc3.contact\r\n- App A retreives current context of type fdc3.instrument${documentation}`;

        return new Promise(async (resolve, reject) => {
          //Retrieve an app channel
          const testChannel = await window.fdc3.getOrCreateChannel(
            "test-channel"
          );

          //Listen for when AppChannel execution is complete
          const resolveExecutionCompleteListener = waitForContext(
            "executionComplete",
            acTestId3,
            await window.fdc3.getOrCreateChannel("app-control")
          );

          const channelsAppCommands = [
            commands.retrieveTestAppChannel,
            commands.broadcastInstrumentContext,
            commands.broadcastContactContext,
          ];

          //Open ChannelsApp then execute commands in order
          await window.fdc3.open(
            "ChannelsApp",
            buildChannelsAppContext(acTestId3, channelsAppCommands, true)
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
          //Retrieve an app channel
          const testChannel = await window.fdc3.getOrCreateChannel(
            "test-channel"
          );

          //Listen for when ChannelsApp execution is complete
          const resolveExecutionCompleteListener = waitForContext(
            "executionComplete",
            acTestId4,
            await window.fdc3.getOrCreateChannel("app-control")
          );

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

          //Open ChannelsApp then execute commands in order
          await window.fdc3.open(
            "ChannelsApp",
            buildChannelsAppContext(acTestId4, channelsAppCommands, true)
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
          const testChannel = await window.fdc3.getOrCreateChannel(
            "test-channel"
          );

          //Listen for when ChannelsApp execution is complete
          const resolveExecutionCompleteListener = waitForContext(
            "executionComplete",
            acTestId5,
            await window.fdc3.getOrCreateChannel("app-control")
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

          //Open ChannelsApp then execute commands in order
          await window.fdc3.open(
            "ChannelsApp",
            buildChannelsAppContext(acTestId5, channelsAppCommands, true)
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
          const testChannel = await window.fdc3.getOrCreateChannel(
            "test-channel"
          );

          //Listen for when ChannelsApp execution is complete
          const resolveExecutionCompleteListener = waitForContext(
            "executionComplete",
            acTestId6,
            await window.fdc3.getOrCreateChannel("app-control")
          );

          //Add context listener
          listener = testChannel.addContextListener(null, (context) => {
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

          //Open ChannelsApp then execute commands in order
          await window.fdc3.open(
            "ChannelsApp",
            buildChannelsAppContext(acTestId6, channelsAppCommands, true)
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
          const testChannel = await window.fdc3.getOrCreateChannel(
            "a-different-test-channel"
          );

          //Add context listener
          listener = testChannel.addContextListener(
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

          //Open ChannelsApp then execute commands in order
          await window.fdc3.open(
            "ChannelsApp",
            buildChannelsAppContext(acTestId7, channelsAppCommands, true)
          );

          //Give listener time to receive context
          await wait();
          resolve();
          return;
        });
      });

      const acTestId8 =
        "Should not receive context when retrieving two different app channels before app B broadcasts the listened type to the first channel that was retrieved";
      it(acTestId8, async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- App A retrieves an app channel\r\n- App A switches to a different app channel\r\n- App A adds a context listener of type fdc3.instrument\r\n- App B retrieves the first channel that A retrieved\r\n- App B broadcasts a context of type fdc3.instrument${documentation}`;

        return new Promise(async (resolve, reject) => {
          //Retrieve an app channel
          let testChannel = await window.fdc3.getOrCreateChannel(
            "test-channel"
          );

          //Listen for when ChannelsApp execution is complete
          const resolveExecutionCompleteListener = waitForContext(
            "executionComplete",
            acTestId8,
            await window.fdc3.getOrCreateChannel("app-control")
          );

          //App A retrieves a different app channel
          testChannel = await window.fdc3.getOrCreateChannel(
            "a-different-test-channel"
          );

          //Add context listener
          listener = testChannel.addContextListener(
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

          //Open ChannelsApp then execute commands in order
          await window.fdc3.open(
            "ChannelsApp",
            buildChannelsAppContext(acTestId8, channelsAppCommands, true)
          );

          //Wait for ChannelsApp to execute
          await resolveExecutionCompleteListener;
          resolve();
          return;
        });
      });

      const acTestId9 =
        "Should receive both contexts when app B broadcasts both contexts to the same app channel and A gets current context for each type";
      it(acTestId9, async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- App A retrieves an app channel\r\n- App B retrieves the same app channel\r\n- App B broadcasts a context of type fdc3.instrument and fdc3.contact\r\n- App A gets current context for types fdc3.instrument and fdc3.contact${documentation}`;

        //Retrieve an app channel
        const testChannel = await window.fdc3.getOrCreateChannel(
          "test-channel"
        );

        const channelsAppCommands = [
          commands.retrieveTestAppChannel,
          commands.broadcastInstrumentContext,
          commands.broadcastContactContext,
        ];

        //Open ChannelsApp then execute commands in order
        await window.fdc3.open(
          "ChannelsApp",
          buildChannelsAppContext(acTestId9, channelsAppCommands)
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
        "Should retrieve the last broadcast context item when app B broadcasts a context with multiple history items to the same app channel and A gets current context";
      it(acTestId10, async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- App A retrieves an app channel\r\n- App B retrieves the same app channel\r\n- App B broadcasts two different contexts of type fdc3.instrument\r\n- App A gets current context for types fdc3.instrument${documentation}`;

        //Retrieve an app channel
        const testChannel = await window.fdc3.getOrCreateChannel(
          "test-channel"
        );

        //Listen for when ChannelsApp execution is complete
        const resolveExecutionCompleteListener = waitForContext(
          "executionComplete",
          acTestId10,
          await window.fdc3.getOrCreateChannel("app-control")
        );

        const channelsAppCommands = [
          commands.retrieveTestAppChannel,
          commands.broadcastInstrumentContext,
        ];

        //Open ChannelsApp and execute commands in order
        await window.fdc3.open(
          "ChannelsApp",
          buildChannelsAppContext(acTestId10, channelsAppCommands, true, 2)
        );

        //Wait for ChannelsApp to execute
        await resolveExecutionCompleteListener;

        //Retrieve fdc3.instrument context
        const context = await testChannel.getCurrentContext("fdc3.instrument");
        expect(context.type).to.be.equals("fdc3.instrument", errorMessage);
        expect(context.name).to.be.equals("History-item-2", errorMessage);
      });

      const acTestId11 =
        "Should retrieve the last broadcast context item when app B broadcasts two different contexts to the same app channel and A gets current context";
      it(acTestId11, async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- App A retrieves an app channel\r\n- App B retrieves the same app channel\r\n- App B broadcasts a context of type fdc3.instrument and fdc3.contact\r\n- App B gets current context with no filter applied${documentation}`;

        //Retrieve an app channel
        const testChannel = await window.fdc3.getOrCreateChannel(
          "test-channel"
        );

        //Listen for when ChannelsApp execution is complete
        const resolveExecutionCompleteListener = waitForContext(
          "executionComplete",
          acTestId11,
          await window.fdc3.getOrCreateChannel("app-control")
        );

        const channelsAppCommands = [
          commands.retrieveTestAppChannel,
          commands.broadcastInstrumentContext,
          commands.broadcastContactContext,
        ];

        //Open ChannelsApp then execute commands in order
        await window.fdc3.open(
          "ChannelsApp",
          buildChannelsAppContext(acTestId11, channelsAppCommands, true)
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
      const channels = await window.fdc3.getSystemChannels();
      if (channels.length > 0) {
        await window.fdc3.joinChannel(channels[channel - 1].id);
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
      const appControlChannel = await window.fdc3.getOrCreateChannel(
        "app-control"
      );
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
    }

    const waitForContext = (
      contextType: string,
      testId: string,
      channel?: Channel
    ) => {
      return new Promise<Context>(async (resolve) => {
        const handler = (context: AppControlContext) => {
          if (testId) {
            if (testId == context.testId) {
              resolve(context);
              listener.unsubscribe();
            } else {
              console.warn(
                `Ignoring ${contextType} context due to mismatched testId (expected: ${testId}, got ${context.testId})`
              );
            }
          } else {
            resolve(context);
            listener.unsubscribe();
          }
        };
        if (channel === undefined) {
          const listener = await window.fdc3.addContextListener(
            contextType,
            handler
          );
        } else {
          //App channels do not auto-broadcast current context when you start listening, so retrieve currnet context to avoid races
          const currentContext  = await channel.getCurrentContext(contextType);
          if (currentContext) handler(currentContext as AppControlContext);
          const listener = await channel.addContextListener(
            contextType,
            handler
          );
        }
      });
    };

    type ChannelsAppContext = Context & {
      commands: string[];
      config: {
        testId: string;
        notifyAppAOnCompletion: boolean;
        historyItems: number;
      };
    };

    function buildChannelsAppContext(
      testId: string,
      mockAppCommands: string[],
      notifyAppAOnCompletion?: boolean,
      historyItems?: number
    ): ChannelsAppContext {
      return {
        type: "channelsAppContext",
        commands: mockAppCommands,
        config: {
          testId: testId,
          notifyAppAOnCompletion: notifyAppAOnCompletion ?? false,
          historyItems: historyItems ?? 1,
        },
      };
    }
  });

const commands = {
  joinSystemChannelOne: "joinSystemChannelOne",
  retrieveTestAppChannel: "retrieveTestAppChannel",
  broadcastInstrumentContext: "broadcastInstrumentContext",
  broadcastContactContext: "broadcastContactContext",
};
