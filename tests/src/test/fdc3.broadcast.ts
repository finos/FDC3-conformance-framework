import { Listener, Channel, Context } from "@finos/fdc3";
import { assert, expect } from "chai";
import constants from "../constants";
import APIDocumentation from "../apiDocuments";

const documentation =
  "\r\nDocumentation: " + APIDocumentation.desktopAgent + "\r\nCause:";
let timeout: NodeJS.Timeout;

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

    describe("User channels", () => {
      beforeEach(async () => {
        await unsubscribeListeners();
        await window.fdc3.leaveCurrentChannel();
      });

      afterEach(async () => {
        await broadcastSystemChannelCloseWindow();
      });

      it("Should receive context when adding a listener then joining a user channel before app B broadcasts context to the same channel", async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- Add fdc3.instrument context listener to app A\r\n- App A joins channel 1\r\n- App B joins channel 1\r\n- App B broadcasts fdc3.instrument context${documentation}`;

        return new Promise(async (resolve, reject) => {
          //Listen for when ChannelsApp execution is complete
          const resolveExecutionCompleteListener =
            waitForChannelsAppToExecute("executionComplete");

          //Add fdc3.instrument context listener
          listener = await window.fdc3.addContextListener(null, (context) => {
            expect(context.type).to.be.oneOf(
              ["fdc3.instrument", "executionComplete"],
              errorMessage
            );
            resolve();
            return;
          });

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
            buildChannelsAppContext(channelsAppCommands, true)
          );

          await waitForChannelsAppToExecute("executionComplete");

          //wait for ChannelsApp to execute
          await resolveExecutionCompleteListener;

          //reject if no context received
          reject(new Error(`${errorMessage} No context received`));
          return;
        });
      });

      it("Should receive context when joining a user channel then adding a context listener before app B broadcasts context to the same channel", async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- App A joins channel 1\r\n- Add listener of type fdc3.instrument to App A\r\n- App B joins channel 1\r\n- App B broadcasts fdc3.instrument context${documentation}`;

        return new Promise(async (resolve, reject) => {
          //Listen for when ChannelsApp execution is complete
          const resolveExecutionCompleteListener =
            waitForChannelsAppToExecute("executionComplete");

          //Join system channel 1
          await joinChannel(1);

          //Add fdc3.instrument context listener
          listener = await window.fdc3.addContextListener(null, (context) => {
            expect(context.type).to.be.oneOf(
              ["fdc3.instrument", "executionComplete"],
              errorMessage
            );
            resolve();
            return;
          });

          validateListenerObject(listener);

          const channelsAppCommands = [
            commands.joinSystemChannelOne,
            commands.broadcastInstrumentContext,
          ];

          //Open ChannelsApp then execute commands in order
          await window.fdc3.open(
            "ChannelsApp",
            buildChannelsAppContext(channelsAppCommands, true)
          );

          //wait for ChannelsApp to execute
          await resolveExecutionCompleteListener;

          //Reject if no context received
          reject(new Error(`${errorMessage} No context received`));
          return;
        });
      });

      it("Should receive context when app B joins then broadcasts context to a user channel before A joins and listens on the same channel", async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- App B joins channel 1\r\n- App B broadcasts fdc3.instrument context\r\n- App A joins channel 1\r\n- App A adds fdc3.instrument context listener${documentation}`;

        return new Promise(async (resolve, reject) => {
          //Listen for when ChannelsApp execution is complete
          const resolveExecutionCompleteListener =
            waitForChannelsAppToExecute("executionComplete");

          const channelsAppCommands = [
            commands.joinSystemChannelOne,
            commands.broadcastInstrumentContext,
          ];

          //Open ChannelsApp then execute commands in order
          await window.fdc3.open(
            "ChannelsApp",
            buildChannelsAppContext(channelsAppCommands, true)
          );

          //Join system channel 1
          await joinChannel(1);

          //Add fdc3.instrument context listener
          listener = await window.fdc3.addContextListener(null, (context) => {
            expect(context.type).to.be.oneOf(
              ["fdc3.instrument", "executionComplete"],
              errorMessage
            );
            resolve();
            return;
          });

          validateListenerObject(listener);

          //wait for ChannelsApp to execute
          await resolveExecutionCompleteListener;

          //Reject if no context received
          reject(new Error(`${errorMessage} No context received`));
          return;
        });
      });

      it("Should receive context when app B broadcasts the listened type to the same user channel", async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- App A adds fdc3.instrument context listener\r\n- App A joins channel 1\r\n- App B joins channel 1\r\n- App B broadcasts context of type fdc3.instrument${documentation}`;

        return new Promise(async (resolve, reject) => {
          //Listen for when ChannelsApp execution is complete
          const resolveExecutionCompleteListener =
            waitForChannelsAppToExecute("executionComplete");

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
            buildChannelsAppContext(channelsAppCommands, true)
          );

          //Wait for ChannelsApp to execute
          await resolveExecutionCompleteListener;

          //Reject if no context received
          reject(new Error(`${errorMessage} No context received`));
          return;
        });
      });

      it("Should receive multiple contexts when app B broadcasts the listened types to the same user channel", async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- App A adds fdc3.instrument and fdc3.contact context listener\r\n- App A joins channel 1\r\n- App B joins channel 1\r\n- App B broadcasts both context types${documentation}`;

        return new Promise(async (resolve, reject) => {
          //Listen for when ChannelsApp execution is complete
          const resolveExecutionCompleteListener =
            waitForChannelsAppToExecute("executionComplete");
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
            buildChannelsAppContext(channelsAppCommands, true)
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

      it("Should not receive context when A & B join different user channels and app B broadcasts a listened type", async () => {
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
            buildChannelsAppContext(channelsAppCommands)
          );

          //Give listener time to receive context
          wait();

          resolve();
          return;
        });
      });

      it("Should not receive context when unsubscribing a user channel before app B broadcasts the listened type to that channel", async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- App A adds context listener of type fdc3.instrument\r\n- App A joins channel 1\r\n- App A unsubscribes the listener\r\n- App B joins channel 1\r\n- App B broadcasts context of type fdc3.instrument${documentation}`;

        return new Promise(async (resolve, reject) => {
          //Listen for when ChannelsApp execution is complete
          const resolveExecutionCompleteListener =
            waitForChannelsAppToExecute("executionComplete");

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
            buildChannelsAppContext(channelsAppCommands, true)
          );

          //Wait for ChannelsApp to execute
          await resolveExecutionCompleteListener;

          resolve();
          return;
        });
      });

      it("Should not receive context when joining two different user channels before app B broadcasts the listened type to the first channel that was joined", async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- App A adds context listener of type fdc3.instrument\r\n- App A joins channel 1\r\n- App A joins channel 2\r\n- App B joins channel 1\r\n- App B broadcasts context of type fdc3.instrument${documentation}`;

        return new Promise(async (resolve, reject) => {
          //Add fdc3.instrument conext listener
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
            buildChannelsAppContext(channelsAppCommands)
          );

          //Give listener time to receive context
          wait();

          resolve();
          return;
        });
      });

      it("Should not receive context when joining and then leaving a user channel before app B broadcasts the listened type to the same channel", async () => {
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
            buildChannelsAppContext(channelsAppCommands)
          );

          //Give listener time to receive context
          wait();

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

      afterEach(async () => {
        await broadcastAppChannelCloseWindow();
      });

      it("Should receive context when app a adds a listener and app B broadcasts to the same app channel", async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- App A retrieves an app channel\r\n- App A adds adds a context listener of type null\r\n- App B retrieves the same app channel as A\r\n- App B broadcasts context of type fdc3.instrument${documentation}`;

        return new Promise(async (resolve, reject) => {
          //Retrieve an app channel
          const testChannel = await window.fdc3.getOrCreateChannel(
            "test-channel"
          );

          //Listen for when ChannelsApp execution is complete
          const resolveExecutionCompleteListener = waitForChannelsAppToExecute(
            "executionComplete",
            testChannel
          );

          //Add context listener
          listener = await testChannel.addContextListener(null, (context) => {
            expect(context.type).to.be.oneOf(
              ["fdc3.instrument", "executionComplete"],
              errorMessage
            );
            resolve();
            return;
          });

          validateListenerObject(listener);

          const channelsAppCommands = [
            commands.retrieveTestAppChannel,
            commands.broadcastInstrumentContext,
          ];

          //Open ChannelsApp then execute commands in order
          await window.fdc3.open(
            "ChannelsApp",
            buildChannelsAppContext(channelsAppCommands, true)
          );

          //Wait for ChannelsApp to execute
          await resolveExecutionCompleteListener;

          //Reject if no context received
          reject(new Error(`${errorMessage} No context received`));
          return;
        });
      });

      it("Should receive context when app B broadcasts context to an app channel before A retrieves current context", async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- App B retrieves an app channel\r\n- App B broadcasts context of type fdc3.instrument\r\n- App A retrieves the same app channel as B\r\n- App A retrieves current context of type null${documentation}`;

        return new Promise(async (resolve, reject) => {
          const channelsAppCommands = [
            commands.retrieveTestAppChannel,
            commands.broadcastInstrumentContext,
          ];

          //Open ChannelsApp then execute commands in order
          await window.fdc3.open(
            "ChannelsApp",
            buildChannelsAppContext(channelsAppCommands)
          );

          //Retrieve an app channel
          const testChannel = await window.fdc3.getOrCreateChannel(
            "test-channel"
          );

          //Retrieve current context from channel
          await testChannel.getCurrentContext().then((context) => {
            expect(context.type).to.be.equals("fdc3.instrument", errorMessage);
            resolve();
            clearTimeout(timeout);
            return;
          });

          //If no context received throw error
          await wait();

          reject(new Error(`${errorMessage} No context received`));
          return;
        });
      });

      it("Should receive context of correct type when app B broadcasts multiple contexts to an app channel before A retrieves current context of a specified type", async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- App B retrieves an app channel\r\n- App B broadcasts context of type fdc3.instrument and then of type fdc3.contact\r\n- App A retrieves the same app channel as B\r\n- App A retreives current context of type fdc3.instrument${documentation}`;

        return new Promise(async (resolve, reject) => {
          const channelsAppCommands = [
            commands.retrieveTestAppChannel,
            commands.broadcastInstrumentContext,
            commands.broadcastContactContext,
          ];

          //Open ChannelsApp then execute commands in order
          await window.fdc3.open(
            "ChannelsApp",
            buildChannelsAppContext(channelsAppCommands, true)
          );

          //Retrieve an app channel
          const testChannel = await window.fdc3.getOrCreateChannel(
            "test-channel"
          );

          //Listen for when ChannelsApp execution is complete
          const resolveExecutionCompleteListener = waitForChannelsAppToExecute(
            "executionComplete",
            testChannel
          );

          await waitForChannelsAppToExecute("executionComplete", testChannel);

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

          //Wait for ChannelsApp to execute
          await resolveExecutionCompleteListener;

          reject(new Error(`${errorMessage} No context received`));
          return;
        });
      });

      it("Should only receive the listened context when app B broadcasts multiple contexts to the same app channel", async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- App A retrieves an app channel\r\n- App A adds a context listener of type fdc3.instrument\r\n- App B retrieves the same app channel as A\r\n- App B broadcasts a context of type fdc3.instrument and fdc3.contact${documentation}`;

        return new Promise(async (resolve, reject) => {
          //Retrieve an app channel
          const testChannel = await window.fdc3.getOrCreateChannel(
            "test-channel"
          );

          //Listen for when ChannelsApp execution is complete
          const resolveExecutionCompleteListener = waitForChannelsAppToExecute(
            "executionComplete",
            testChannel
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
            buildChannelsAppContext(channelsAppCommands, true)
          );

          //Wait for ChannelsApp to execute
          await resolveExecutionCompleteListener;

          //If no context received throw error
          reject(new Error(`${errorMessage} No context received`));
          return;
        });
      });

      it("Should receive multiple contexts when app B broadcasts the listened types to the same app channel", async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- App A retrieves an app channel\r\n- App A adds a context listener of type fdc3.instrument and fdc3.contact\r\n- App B retrieves the same app channel as A\r\n- App B broadcasts a context of type fdc3.instrument and fdc3.contact${documentation}`;

        return new Promise(async (resolve, reject) => {
          let contextTypes: string[] = [];
          //Retrieve an app channel
          const testChannel = await window.fdc3.getOrCreateChannel(
            "test-channel"
          );

          //Listen for when ChannelsApp execution is complete
          const resolveExecutionCompleteListener = waitForChannelsAppToExecute(
            "executionComplete",
            testChannel
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
            buildChannelsAppContext(channelsAppCommands, true)
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

      it("Should not receive context when unsubscribing an app channel before app B broadcasts to that channel", async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- App A retrieves an app channel\r\n- App A adds a context listener of type null\r\n- App A unsubscribes the app channel\r\n- App B retrieves the same app channel\r\n- App B broadcasts a context of type fdc3.instrument and fdc3.contact${documentation}`;

        return new Promise(async (resolve, reject) => {
          //Retrieve an app channel
          const testChannel = await window.fdc3.getOrCreateChannel(
            "test-channel"
          );

          //Listen for when ChannelsApp execution is complete
          const resolveExecutionCompleteListener = waitForChannelsAppToExecute(
            "executionComplete",
            testChannel
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
            buildChannelsAppContext(channelsAppCommands, true)
          );

          //Wait for ChannelsApp to execute
          await resolveExecutionCompleteListener;

          resolve();
          return;
        });
      });

      it("Should not receive context when app B broadcasts context to a different app channel", async () => {
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
            buildChannelsAppContext(channelsAppCommands, true)
          );

          //Give listener time to receive context
          wait();

          resolve();
          return;
        });
      });

      it("Should not receive context when retrieving two different app channels before app B broadcasts the listened type to the first channel that was retrieved", async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- App A retrieves an app channel\r\n- App A switches to a different app channel\r\n- App A adds a context listener of type fdc3.instrument\r\n- App B retrieves the first channel that A retrieved\r\n- App B broadcasts a context of type fdc3.instrument${documentation}`;

        return new Promise(async (resolve, reject) => {
          //Retrieve an app channel
          let testChannel = await window.fdc3.getOrCreateChannel(
            "test-channel"
          );

          //Listen for when ChannelsApp execution is complete
          const resolveExecutionCompleteListener = waitForChannelsAppToExecute(
            "executionComplete",
            testChannel
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
            buildChannelsAppContext(channelsAppCommands, true)
          );

          //Wait for ChannelsApp to execute
          await resolveExecutionCompleteListener;

          resolve();
          return;
        });
      });

      it("Should receive both contexts when app B broadcasts both contexts to the same app channel and A gets current context for each type", async () => {
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
          buildChannelsAppContext(channelsAppCommands)
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

      it("Should retrieve the last broadcast context item when app B broadcasts a context with multiple history items to the same app channel and A gets current context", async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- App A retrieves an app channel\r\n- App B retrieves the same app channel\r\n- App B broadcasts two different contexts of type fdc3.instrument\r\n- App A gets current context for types fdc3.instrument${documentation}`;

        //Retrieve an app channel
        const testChannel = await window.fdc3.getOrCreateChannel(
          "test-channel"
        );

        //Listen for when ChannelsApp execution is complete
        const resolveExecutionCompleteListener = waitForChannelsAppToExecute(
          "executionComplete",
          testChannel
        );

        const channelsAppCommands = [
          commands.retrieveTestAppChannel,
          commands.broadcastInstrumentContext,
        ];

        //Open ChannelsApp and execute commands in order
        await window.fdc3.open(
          "ChannelsApp",
          buildChannelsAppContext(channelsAppCommands, true, 2)
        );

        //Wait for ChannelsApp to execute
        await resolveExecutionCompleteListener;

        //Retrieve fdc3.instrument context
        const context = await testChannel.getCurrentContext("fdc3.instrument");

        expect(context.type).to.be.equals("fdc3.instrument", errorMessage);
        expect(context.name).to.be.equals("History-item-2", errorMessage);
      });

      it("Should retrieve the last broadcast context item when app B broadcasts two different contexts to the same app channel and A gets current context", async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- App A retrieves an app channel\r\n- App B retrieves the same app channel\r\n- App B broadcasts a context of type fdc3.instrument and fdc3.contact\r\n- App B gets current context with no filter applied${documentation}`;

        //Retrieve an app channel
        const testChannel = await window.fdc3.getOrCreateChannel(
          "test-channel"
        );

        //Listen for when ChannelsApp execution is complete
        const resolveExecutionCompleteListener = waitForChannelsAppToExecute(
          "executionComplete",
          testChannel
        );

        const channelsAppCommands = [
          commands.retrieveTestAppChannel,
          commands.broadcastInstrumentContext,
          commands.broadcastContactContext,
        ];

        //Open ChannelsApp then execute commands in order
        await window.fdc3.open(
          "ChannelsApp",
          buildChannelsAppContext(channelsAppCommands, true)
        );

        //Wait for ChannelsApp to execute
        await resolveExecutionCompleteListener;

        const context = await testChannel.getCurrentContext();

        if (context === null) {
          assert.fail("No Context retrieved", errorMessage);
        } else if (context.type === "closeWindow") {
          assert.fail(
            "Did not retrieve last broadcast context from app B",
            errorMessage
          );
        } else {
          expect(context.type).to.be.equals("executionComplete", errorMessage);
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
        timeout = setTimeout(() => {
          resolve(true);
        }, constants.WaitTime);
      });
    }

    const broadcastSystemChannelCloseWindow = async () => {
      await window.fdc3.broadcast({ type: "closeWindow" });
      return new Promise<void>((resolve) => setTimeout(() => resolve(), 3000)); // Wait until close window event is handled
    };

    const broadcastAppChannelCloseWindow = async () => {
      const testChannel = await window.fdc3.getOrCreateChannel("test-channel");
      await testChannel.broadcast({ type: "closeWindow" });
      return new Promise<void>((resolve) => setTimeout(() => resolve(), 3000)); // Wait until close window event is handled
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

    const waitForChannelsAppToExecute = (
      contextType: string,
      channel?: Channel
    ) => {
      return new Promise<Context>(async (resolve) => {
        if (channel === undefined) {
          const listener = await window.fdc3.addContextListener(
            contextType,
            (context) => {
              resolve(context);
              listener.unsubscribe();
            }
          );
        } else {
          const listener = await channel.addContextListener(
            contextType,
            (context) => {
              resolve(context);
              listener.unsubscribe();
            }
          );
        }
      });
    };

    function buildChannelsAppContext(
      mockAppCommands: string[],
      notifyAppAOnCompletion?: boolean,
      historyItems?: number
    ) {
      return {
        type: "channelsAppContext",
        commands: mockAppCommands,
        config: {
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
