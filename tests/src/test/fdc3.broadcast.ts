import { Listener, Channel, Context, ContextTypes } from "@finos/fdc3";
import { assert, expect } from "chai";
import constants from "../constants";
import APIDocumentation from "../apiDocuments";

const documentation =
  "\r\nDocumentation: " + APIDocumentation.desktopAgent + "\r\nCause:";

export default () =>
  describe("fdc3.broadcast", () => {
    let listener: Listener;
    let listener2: Listener;

    let channelsAppContext = {
      type: "channelsAppContext",
      reverseFunctionCallOrder: false,
      contextBroadcasts: {
        instrument: true,
        contact: false,
      },
      joinAppChannel: false,
      broadcastMultipleItems: false,
      executionComplete: false,
    };

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
        resetChannelsAppContext();
      });

      afterEach(async () => {
        await broadcastSystemChannelCloseWindow();
      });

      it("Should receive context when adding a listener then joining a user channel before app B broadcasts context to the same channel", async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- Add fdc3.instrument context listener to app A\r\n- App A joins channel 1\r\n- App B joins channel 1\r\n- App B broadcasts fdc3.instrument context${documentation}`;

        return new Promise(async (resolve, reject) => {
          //Add context listener to app A
          listener = await window.fdc3.addContextListener(null, (context) => {
            expect(context.type).to.be.equal("fdc3.instrument", errorMessage);
            resolve();
          });

          validateListenerObject(listener);

          //App A joins channel 1
          await joinChannel(1);

          //Open ChannelsApp app. ChannelsApp joins channel 1, then broadcasts context
          window.fdc3.open("ChannelsApp", channelsAppContext);

          //if no context received throw error
          await wait();
          reject(new Error(`${errorMessage} No context received`));
        });
      });

      it("Should receive context when joining a user channel then adding a context listener before app B broadcasts context to the same channel", async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- App A joins channel 1\r\n- Add listener of type fdc3.instrument to App A\r\n- App B joins channel 1\r\n- App B broadcasts fdc3.instrument context${documentation}`;

        return new Promise(async (resolve, reject) => {
          //App A joins channel 1
          await joinChannel(1);

          //Add context listener to app A
          listener = await window.fdc3.addContextListener(null, (context) => {
            expect(context.type).to.be.equal("fdc3.instrument", errorMessage);
            resolve();
          });

          validateListenerObject(listener);

          //Open ChannelsApp app. channels app joins channel 1, then broadcasts context
          await window.fdc3.open("ChannelsApp", channelsAppContext);

          //if no context received throw error
          await wait();
          reject(new Error(`${errorMessage} No context received`));
        });
      });

      it("Should receive context when app B joins then broadcasts context to a user channel before A joins and listens on the same channel", async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- App B joins channel 1\r\n- App B broadcasts fdc3.instrument context\r\n- App A joins channel 1\r\n- App A adds fdc3.instrument context listener${documentation}`;

        return new Promise(async (resolve, reject) => {
          //Open ChannelsApp app. channels app joins channel 1, then broadcasts context
          await window.fdc3.open("ChannelsApp", channelsAppContext);

          //App A joins channel 1
          await joinChannel(1);

          //Add context listener to app A
          listener = await window.fdc3.addContextListener(null, (context) => {
            expect(context.type).to.be.equal("fdc3.instrument", errorMessage);
            resolve();
          });

          validateListenerObject(listener);

          //if no context received throw error
          await wait();
          reject(new Error(`${errorMessage} No context received`));
        });
      });

      it("Should receive context when app B broadcasts then joins a user channel before A joins and listens on the same channel", async () => {
        let errorMessage = `\r\nSteps to reproduce:\r\n- App B broadcasts fdc3.instrument context\r\n- App B joins channel 1\r\n- App A joins channel 1\r\n- App A adds a context listener of type null${documentation}`;

        return new Promise(async (resolve, reject) => {
          channelsAppContext.reverseFunctionCallOrder = true;

          //Open ChannelsApp app. ChannelsApp broadcasts context, then joins channel 1
          await window.fdc3.open("ChannelsApp", channelsAppContext);

          //wait for ChannelsApp to run
          await wait();

          //App A joins channel 1
          await joinChannel(1);

          //Add context listener to app A
          listener = await window.fdc3.addContextListener(null, (context) => {
            expect(context.type).to.be.equal("fdc3.instrument", errorMessage);
            resolve();
          });

          validateListenerObject(listener);

          //if no context received throw error
          await wait();
          reject(new Error(`${errorMessage} No context received`));
        });
      });

      it("Should receive context when app B broadcasts the listened type to the same user channel", async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- App A adds fdc3.instrument context listener\r\n- App A joins channel 1\r\n- App B joins channel 1\r\n- App B broadcasts context of type fdc3.instrument${documentation}`;

        return new Promise(async (resolve, reject) => {
          channelsAppContext.contextBroadcasts.contact = true;

          //Add context listener to app A
          listener = await window.fdc3.addContextListener(
            "fdc3.instrument",
            (context) => {
              expect(context.type).to.be.equals(
                "fdc3.instrument",
                errorMessage
              );
              resolve();
            }
          );

          validateListenerObject(listener);

          //App A joins channel 1
          joinChannel(1);

          //Open ChannelsApp app. ChannelsApp joins channel 1, then broadcasts both contexts
          window.fdc3.open("ChannelsApp", channelsAppContext);

          //if no context received throw error
          await wait();
          reject(new Error(`${errorMessage} No context received`));
        });
      });

      it("Should receive multiple contexts when app B broadcasts the listened types to the same user channel", async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- App A adds fdc3.instrument and fdc3.contact context listener\r\n- App A joins channel 1\r\n- App B joins channel 1\r\n- App B broadcasts both context types${documentation}`;

        return new Promise(async (resolve, reject) => {
          let contextTypes: string[] = [];
          channelsAppContext.contextBroadcasts.contact = true;

          //Add context listener to app A
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

          //App A joins channel 1
          await joinChannel(1);

          //Open ChannelsApp app. ChannelsApp joins channel 1, then broadcasts both contexts
          await window.fdc3.open("ChannelsApp", channelsAppContext);

          function checkIfBothContextsReceived() {
            if (contextTypes.length === 2) {
              if (
                !contextTypes.includes("fdc3.contact") ||
                !contextTypes.includes("fdc3.instrument")
              ) {
                assert.fail("Incorrect context received", errorMessage);
              } else {
                resolve();
              }
            }
          }

          //if no context received throw error
          await wait();
          reject(
            new Error(`${errorMessage} At least one context was not received`)
          );
        });
      });

      it("Should not receive context when A & B join different user channels and app B broadcasts a listened type", async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- App A adds fdc3.instrument and fdc3.contact context listener\r\n- App A joins channel 2\r\n- App B joins channel 1\r\n- App B broadcasts both context types${documentation}`;

        return new Promise(async (resolve, reject) => {
          channelsAppContext.contextBroadcasts.contact = true;

          //Add two context listeners to app A
          listener = window.fdc3.addContextListener(
            "fdc3.instrument",
            (context) =>
              reject(
                new Error(`${errorMessage} ${context.type} context received`)
              )
          );

          validateListenerObject(listener);

          listener2 = window.fdc3.addContextListener(
            "fdc3.contact",
            (context) =>
              reject(
                new Error(`${errorMessage} ${context.type} context received`)
              )
          );

          validateListenerObject(listener2);

          //App A joins channel 2
          await joinChannel(2);

          //Open ChannelsApp app. ChannelsApp joins channel 1, then broadcasts both contexts
          await window.fdc3.open("ChannelsApp", channelsAppContext);

          //give listener time to receive context
          await wait();
          resolve();
        });
      });

      it("Should not receive context when unsubscribing a user channel before app B broadcasts the listened type to that channel", async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- App A adds context listener of type fdc3.instrument\r\n- App A joins channel 1\r\n- App A unsubscribes the listener\r\n- App B joins channel 1\r\n- App B broadcasts context of type fdc3.instrument${documentation}`;

        return new Promise(async (resolve, reject) => {
          channelsAppContext.executionComplete = true;

          //listens for when app B execution is complete
          const executionCompleteContext =
            executionCompleteListener("executionComplete");

          //Add context listener
          listener = window.fdc3.addContextListener(
            "fdc3.instrument",
            (context) =>
              reject(
                new Error(`${errorMessage} ${context.type} context received`)
              )
          );

          validateListenerObject(listener);

          //App A joins channel 1
          await joinChannel(1);

          //unsubscribe from listeners
          if (listener !== undefined) {
            await listener.unsubscribe();
            listener = undefined;
          } else {
            assert.fail("Listener undefined", errorMessage);
          }

          //Open ChannelsApp app. ChannelsApp joins channel 1, then broadcasts both contexts
          window.fdc3.open("ChannelsApp", channelsAppContext);

          await executionCompleteContext;
          resolve();
        });
      });

      it("Should not receive context when joining two different user channels before app B broadcasts the listened type to the first channel that was joined", async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- App A adds context listener of type fdc3.instrument\r\n- App A joins channel 1\r\n- App A joins channel 2\r\n- App B joins channel 1\r\n- App B broadcasts context of type fdc3.instrument${documentation}`;

        return new Promise(async (resolve, reject) => {
          channelsAppContext.executionComplete = true;

          //listens for when app B execution is complete
          const executionCompleteContext =
            executionCompleteListener("executionComplete");

          //Add context listeners to app A
          listener = window.fdc3.addContextListener(
            "fdc3.instrument",
            (context) =>
              reject(
                new Error(`${errorMessage} ${context.type} context received`)
              )
          );

          validateListenerObject(listener);

          //App A joins a channel and then joins another
          await joinChannel(1);
          await joinChannel(2);

          //Open ChannelsApp app. ChannelsApp joins channel 1, then broadcasts both contexts
          window.fdc3.open("ChannelsApp", channelsAppContext);

          await executionCompleteContext;
          resolve();
        });
      });

      it("Should not receive context when joining and then leaving a user channel before app B broadcasts the listened type to the same channel", async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- App A adds context listener of type fdc3.instrument\r\n- App A joins channel 1\r\n- App A leaves channel 1\r\n- App B joins channel 1\r\n- App B broadcasts context of type fdc3.instrument${documentation}`;

        return new Promise(async (resolve, reject) => {
          //Add a context listeners to app A
          listener = window.fdc3.addContextListener(
            "fdc3.instrument",
            (context) =>
              reject(
                new Error(`${errorMessage} ${context.type} context received`)
              )
          );

          validateListenerObject(listener);

          //App A joins channel 1
          await joinChannel(1);

          //App A leaves channel 1
          await window.fdc3.leaveCurrentChannel();

          //App B joins channel 1, then broadcasts both contexts
          await window.fdc3.open("ChannelsApp", channelsAppContext);

          //give listener time to receive context
          await wait();
          resolve();
        });
      });

      it("Should throw NOT DELIVERED error when system broadcast is sent with an invalid context object structure", async () => {
        try {
          // @ts-ignore
          await window.fdc3.broadcast({
            id: { ticker: "AAPL" },
          });
          assert.fail("No error thrown");
        } catch (ex) {
          expect(ex).to.have.property("message", "NOT DELIVERED");
        }
      });
    });

    describe("App channels", () => {
      beforeEach(async () => {
        await unsubscribeListeners();
        await window.fdc3.leaveCurrentChannel();
        resetChannelsAppContext();
      });

      afterEach(async () => {
        await broadcastAppChannelCloseWindow();
      });

      it("Should receive context when app B broadcasts the listened type to the same app channel", async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- App A joins an app channel\r\n- App A adds adds a context listener of type null\r\n- App B joins the same app channel as A\r\n- App B broadcasts context of type fdc3.instrument${documentation}`;

        return new Promise(async (resolve, reject) => {
          channelsAppContext.joinAppChannel = true;

          //App A joins app channel
          const testChannel = await window.fdc3.getOrCreateChannel(
            "test-channel"
          );

          //Add context listener to app A
          listener = await testChannel.addContextListener(null, (context) => {
            expect(context.type).to.be.equals("fdc3.instrument", errorMessage);
            resolve();
          });

          validateListenerObject(listener);

          //App B joins the same app channel as A then broadcasts context
          await window.fdc3.open("ChannelsApp", channelsAppContext);

          //if no context received throw error
          await wait();
          reject(new Error(`${errorMessage} No context received`));
        });
      });

      it("Should receive context when app B broadcasts context to an app channel before A joins and listens on the same channel", async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- App B joins an app channel\r\n- App B broadcasts context of type fdc3.instrument\r\n- App A joins the same app channel as B\r\n- App A adds a context listener of type null${documentation}`;

        return new Promise(async (resolve, reject) => {
          channelsAppContext.joinAppChannel = true;

          //App B creates/joins an app channel then broadcasts context
          await window.fdc3.open("ChannelsApp", channelsAppContext);

          //give app B time to fully execute
          await wait();

          //App A joins app channel
          const testChannel = await window.fdc3.getOrCreateChannel(
            "test-channel"
          );

          //Add context listener to app A
          listener = await testChannel.addContextListener(null, (context) => {
            expect(context.type).to.be.equals("fdc3.instrument", errorMessage);
            resolve();
          });

          validateListenerObject(listener);

          //if no context received throw error
          await wait();
          reject(new Error(`${errorMessage} No context received`));
        });
      });

      it("Should only receive the listened context when app B broadcasts multiple contexts to the same app channel", async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- App A joins an app channel\r\n- App A adds a context listener of type fdc3.instrument\r\n- App B joins the same app channel as A\r\n- App B broadcasts a context of type fdc3.instrument and fdc3.contact${documentation}`;

        return new Promise(async (resolve, reject) => {
          channelsAppContext.joinAppChannel = true;
          channelsAppContext.contextBroadcasts.contact = true;

          //App A joins app channel
          const testChannel = await window.fdc3.getOrCreateChannel(
            "test-channel"
          );

          //Add context listener to app A
          listener = await testChannel.addContextListener(
            "fdc3.instrument",
            (context) => {
              expect(context.type).to.be.equals(
                "fdc3.instrument",
                errorMessage
              );
              resolve();
            }
          );

          validateListenerObject(listener);

          //App B joins the same app channel as A then broadcasts two contexts
          await window.fdc3.open("ChannelsApp", channelsAppContext);

          //if no context received throw error
          await wait();
          reject(new Error(`${errorMessage} No context received`));
        });
      });

      it("Should receive multiple contexts when app B broadcasts the listened types to the same app channel", async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- App A joins an app channel\r\n- App A adds a context listener of type fdc3.instrument and fdc3.contact\r\n- App B joins the same app channel as A\r\n- App B broadcasts a context of type fdc3.instrument and fdc3.contact${documentation}`;

        return new Promise(async (resolve, reject) => {
          let contextTypes: string[] = [];
          channelsAppContext.joinAppChannel = true;
          channelsAppContext.contextBroadcasts.contact = true;

          //App A joins app channel
          const testChannel = await window.fdc3.getOrCreateChannel(
            "test-channel"
          );

          //Add context listener to app A
          listener = await testChannel.addContextListener(
            "fdc3.instrument",
            (context) => {
              contextTypes.push(context.type);
              checkIfBothContextsReceived();
            }
          );

          validateListenerObject(listener);

          //Add a second context listener to app A
          listener2 = await testChannel.addContextListener(
            "fdc3.contact",
            (context) => {
              contextTypes.push(context.type);
              checkIfBothContextsReceived();
            }
          );

          validateListenerObject(listener2);

          //App B joins the same app channel as A then broadcasts context
          await window.fdc3.open("ChannelsApp", channelsAppContext);

          function checkIfBothContextsReceived() {
            if (contextTypes.length === 2) {
              if (
                !contextTypes.includes("fdc3.contact") ||
                !contextTypes.includes("fdc3.instrument")
              ) {
                assert.fail("Incorrect context received", errorMessage);
              } else {
                resolve();
              }
            }
          }

          //if no context received throw error
          await wait();
          reject(new Error(`${errorMessage} No context received`));
        });
      });

      it("Should not receive context when listening for all context types then unsubscribing an app channel before app B broadcasts to that channel", async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- App A joins an app channel\r\n- App A adds a context listener of type null\r\n- App A unsubscribes the app channel\r\n- App B joins the same app channel as A\r\n- App B broadcasts a context of type fdc3.instrument and fdc3.contact${documentation}`;

        return new Promise(async (resolve, reject) => {
          channelsAppContext.joinAppChannel = true;
          channelsAppContext.contextBroadcasts.contact = true;
          channelsAppContext.executionComplete = true;

          //App A joins app channel
          const testChannel = await window.fdc3.getOrCreateChannel(
            "test-channel"
          );

          //listens for when app B execution is complete
          const executionCompleteContext = executionCompleteListener(
            "executionComplete",
            testChannel
          );

          //Add context listener to app A
          listener = testChannel.addContextListener(null, (context) => {
            reject(
              new Error(`${errorMessage} ${context.type} context received`)
            );
          });

          validateListenerObject(listener);

          //Unsubscribe from app channel
          listener.unsubscribe();

          //App B joins the same app channel as A then broadcasts context
          window.fdc3.open("ChannelsApp", channelsAppContext);

          await executionCompleteContext;
          resolve();
        });
      });

      it("Should not receive context when unsubscribing an app channel before app B broadcasts the listened type to that channel", async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- App A joins an app channel\r\n- App A adds a context listener of type fdc3.instrument\r\n- App A unsubscribes the app channel\r\n- App B joins the same app channel as A\r\n- App B broadcasts a context of type fdc3.instrument and fdc3.contact${documentation}`;

        return new Promise(async (resolve, reject) => {
          channelsAppContext.joinAppChannel = true;
          channelsAppContext.contextBroadcasts.contact = true;
          channelsAppContext.executionComplete = true;

          //App A joins app channel
          const testChannel = await window.fdc3.getOrCreateChannel(
            "test-channel"
          );

          //listens for when app B execution is complete
          const executionCompleteContext = executionCompleteListener(
            "executionComplete",
            testChannel
          );

          //Add context listener to app A
          listener = testChannel.addContextListener(null, (context) => {
            reject(
              new Error(`${errorMessage} ${context.type} context received`)
            );
          });

          validateListenerObject(listener);

          //Unsubscribe from app channel
          listener.unsubscribe();

          //App B joins the same app channel as A then broadcasts context
          window.fdc3.open("ChannelsApp", channelsAppContext);

          await executionCompleteContext;
          resolve();
        });
      });

      it("Should not receive context when app B broadcasts context to a different app channel", async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- App A joins an app channel\r\n- App A adds a context listener of type fdc3.instrument\r\n- App B joins a different app channel\r\n- App B broadcasts a context of type fdc3.instrument${documentation}`;

        return new Promise(async (resolve, reject) => {
          channelsAppContext.joinAppChannel = true;

          //App A joins app channel
          const testChannel = await window.fdc3.getOrCreateChannel(
            "a-different-test-channel"
          );

          //Add context listener to app A
          listener = testChannel.addContextListener(
            "fdc3.instrument",
            (context) =>
              reject(
                new Error(`${errorMessage} ${context.type} context received`)
              )
          );

          validateListenerObject(listener);

          //App B joins the same app channel as A then broadcasts context
          await window.fdc3.open("ChannelsApp", channelsAppContext);

          //give listener time to receive context
          await wait();
          resolve();
        });
      });

      it("Should not receive context when joining two different app channels before app B broadcasts the listened type to the first channel that was joined", async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- App A joins an app channel\r\n- App A switches to a different app channel\r\n- App A adds a context listener of type fdc3.instrument\r\n- App B joins the first channel that A joined\r\n- App B broadcasts a context of type fdc3.instrument${documentation}`;

        return new Promise(async (resolve, reject) => {
          channelsAppContext.joinAppChannel = true;

          //App A joins app channel
          let testChannel = await window.fdc3.getOrCreateChannel(
            "test-channel"
          );

          //App A joins different app channel
          testChannel = await window.fdc3.getOrCreateChannel(
            "a-different-test-channel"
          );

          //Add context listener to app A
          listener = testChannel.addContextListener(
            "fdc3.instrument",
            (context) =>
              reject(
                new Error(`${errorMessage} ${context.type} context received`)
              )
          );

          validateListenerObject(listener);

          //App B joins the first channel that A joined then broadcasts context
          window.fdc3.open("ChannelsApp", channelsAppContext);

          //give listener time to receive context
          await wait();
          resolve();
        });
      });

      it("Should throw NOT DELIVERED error when an app channel broadcast is sent with an invalid Context object structure", async () => {
        try {
          const testChannel = await window.fdc3.getOrCreateChannel(
            "test-channel"
          );

          // @ts-ignore
          await testChannel.broadcast({
            id: { ticker: "AAPL" },
          });
          assert.fail("No error thrown");
        } catch (ex) {
          expect(ex).to.have.property("message", "NOT DELIVERED");
        }
      });

      it("Should receive both contexts when app B broadcasts both contexts to the same app channel and A gets current context for each type", async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- App A joins an app channel\r\n- App B joins the same app channel\r\n- App B broadcasts a context of type fdc3.instrument and fdc3.contact\r\n- App A gets current context for types fdc3.instrument and fdc3.contact${documentation}`;

        channelsAppContext.joinAppChannel = true;
        channelsAppContext.contextBroadcasts.contact = true;

        //App A joins app channel
        const testChannel = await window.fdc3.getOrCreateChannel(
          "test-channel"
        );

        //App B joins the same app channel as A then broadcasts context
        await window.fdc3.open("ChannelsApp", channelsAppContext);

        //get contexts from app B
        const context = await testChannel.getCurrentContext("fdc3.instrument");

        expect(context.type).to.be.equals("fdc3.instrument", errorMessage);

        const contactContext = await testChannel.getCurrentContext(
          "fdc3.contact"
        );

        expect(contactContext.type).to.be.equals("fdc3.contact", errorMessage);
      });

      it("Should retrieve the last broadcast context item when app B broadcasts a context with multiple history items to the same app channel and A gets current context", async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- App A joins an app channel\r\n- App B joins the same app channel\r\n- App B broadcasts two different contexts of type fdc3.instrument\r\n- App A gets current context for types fdc3.instrument${documentation}`;

        channelsAppContext.joinAppChannel = true;
        channelsAppContext.broadcastMultipleItems = true;

        //App A joins app channel
        const testChannel = await window.fdc3.getOrCreateChannel(
          "test-channel"
        );

        //App B joins the same app channel as A then broadcasts context
        await window.fdc3.open("ChannelsApp", channelsAppContext);

        //get contexts from app B
        const context = await testChannel.getCurrentContext("fdc3.instrument");

        expect(context.type).to.be.equals("fdc3.instrument", errorMessage);
        expect(context.name).to.be.equals("History-item-2", errorMessage);
      });

      it("Should retrieve the last broadcast context item when app B broadcasts two different contexts to the same app channel and A gets current context", async () => {
        const errorMessage = `\r\nSteps to reproduce:\r\n- App A joins an app channel\r\n- App B joins the same app channel\r\n- App B broadcasts a context of type fdc3.instrument and fdc3.contact\r\n- App B gets current context with no filter applied${documentation}`;

        channelsAppContext.joinAppChannel = true;
        channelsAppContext.executionComplete = true;
        channelsAppContext.contextBroadcasts.contact = true;

        //App A joins app channel
        const testChannel = await window.fdc3.getOrCreateChannel(
          "test-channel"
        );

        //listens for when app B execution is complete
        const executionCompleteContext = executionCompleteListener(
          "executionComplete",
          testChannel
        );

        //App B joins the same app channel as A then broadcasts context
        await window.fdc3.open("ChannelsApp", channelsAppContext);

        await executionCompleteContext;

        //get current context
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
      return new Promise((resolve) =>
        setTimeout(() => {
          resolve(true);
        }, constants.WaitTime)
      );
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

    function resetChannelsAppContext() {
      channelsAppContext.broadcastMultipleItems = false;
      channelsAppContext.joinAppChannel = false;
      channelsAppContext.contextBroadcasts.contact = false;
      channelsAppContext.reverseFunctionCallOrder = false;
      channelsAppContext.executionComplete = false;
    }

    const executionCompleteListener = (
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
  });
