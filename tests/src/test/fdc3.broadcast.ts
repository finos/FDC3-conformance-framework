import { Listener, Channel, Context } from "@finos/fdc3";
import { assert, expect } from "chai";

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

    beforeEach(async () => {
      await unsubscribeListeners();
      await window.fdc3.leaveCurrentChannel();
      resetChannelsAppContext();
    });

    it("Broadcast method is callable", async () => {
      await window.fdc3.broadcast({
        type: "fdc3.instrument",
        id: { ticker: "AAPL" },
      });
    });

    describe("User channels", () => {
      afterEach(async () => {
        await broadcastSystemChannelCloseWindow();
      });

      it("Should receive context when adding a listener then joining a user channel before app B broadcasts context to the same channel", async () => {
        return new Promise(async (resolve) => {
          //Add context listener to app A
          listener = await window.fdc3.addContextListener(
            "fdc3.instrument",
            (context) => {
              expect(context.type).to.be.equals("fdc3.instrument");
              resolve();
            }
          );

          assert.isObject(listener);
          expect(typeof listener.unsubscribe).to.be.equals("function");

          //App A joins channel 1
          await joinChannel(1);

          //Open ChannelsApp app. ChannelsApp joins channel 1, then broadcasts context
          window.fdc3.open("ChannelsApp", channelsAppContext);
        });
      });

      it("Should receive context when joining a user channel then adding a context listener before app B broadcasts context to the same channel", async () => {
        return new Promise(async (resolve) => {
          const channels = await window.fdc3.getSystemChannels();

          //App A joins channel 1
          await joinChannel(1);

          //Add context listener to app A
          listener = await window.fdc3.addContextListener(
            "fdc3.instrument",
            (context) => {
              expect(context.type).to.be.equals("fdc3.instrument");
              resolve();
            }
          );

          assert.isObject(listener);
          expect(typeof listener.unsubscribe).to.be.equals("function");

          //Open ChannelsApp app. channels app joins channel 1, then broadcasts context
          await window.fdc3.open("ChannelsApp", channelsAppContext);
        });
      });

      it("Should receive context when app B joins then broadcasts context to a user channel before A joins and listens on the same channel", async () => {
        return new Promise(async (resolve) => {
          //Open ChannelsApp app. channels app joins channel 1, then broadcasts context
          await window.fdc3.open("ChannelsApp", channelsAppContext);

          //App A joins channel 1
          await joinChannel(1);

          //Add context listener to app A
          listener = await window.fdc3.addContextListener(
            "fdc3.instrument",
            (context) => {
              expect(context.type).to.be.equals("fdc3.instrument");
              resolve();
            }
          );

          assert.isObject(listener);
          expect(typeof listener.unsubscribe).to.be.equals("function");
        });
      });

      it("Should receive context when app B broadcasts then joins a user channel before A joins and listens on the same channel", async () => {
        channelsAppContext.reverseFunctionCallOrder = true;
        channelsAppContext.executionComplete = true;

        return new Promise(async (resolve) => {
          //listens for when app B execution is complete
          const executionCompleteContext =
            executionCompleteListener("executionComplete");

          //Open ChannelsApp app. ChannelsApp broadcasts context, then joins channel 1
          window.fdc3.open("ChannelsApp", channelsAppContext);

          await executionCompleteContext;

          //App A joins channel 1
          await joinChannel(1);

          //Add context listener to app A
          listener = await window.fdc3.addContextListener(
            "fdc3.instrument",
            (context) => {
              expect(context.type).to.be.equals("fdc3.instrument");
              resolve();
            }
          );

          assert.isObject(listener);
          expect(typeof listener.unsubscribe).to.be.equals("function");
        });
      });

      it("Should receive context when app B broadcasts the listened type to the same user channel", async () => {
        return new Promise(async (resolve) => {
          channelsAppContext.contextBroadcasts.contact = true;

          //Add context listener to app A
          listener = await window.fdc3.addContextListener(
            "fdc3.instrument",
            (context) => {
              expect(context.type).to.be.equals("fdc3.instrument");
              resolve();
            }
          );

          assert.isObject(listener);
          expect(typeof listener.unsubscribe).to.be.equals("function");

          //App A joins channel 1
          joinChannel(1);

          //Open ChannelsApp app. ChannelsApp joins channel 1, then broadcasts both contexts
          window.fdc3.open("ChannelsApp", channelsAppContext);
        });
      });

      it("Should receive multiple contexts when app B broadcasts the listened types to the same user channel", async () => {
        return new Promise(async (resolve) => {
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

          assert.isObject(listener);
          expect(typeof listener.unsubscribe).to.be.equals("function");

          //Add second context listener to app A
          listener2 = await window.fdc3.addContextListener(
            "fdc3.contact",
            (context) => {
              contextTypes.push(context.type);
              checkIfBothContextsReceived();
            }
          );

          assert.isObject(listener2);
          expect(typeof listener2.unsubscribe).to.be.equals("function");

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
                assert.fail("Incorrect context received");
              } else {
                resolve();
              }
            }
          }
        });
      });

      it("Should not receive context when A & B join different user channels and app B broadcasts a listened type", async () => {
        channelsAppContext.contextBroadcasts.contact = true;
        //Add two context listeners to app A
        listener = await addContextListener("fdc3.instrument");
        listener2 = await addContextListener("fdc3.contact");

        //App A joins channel 2
        await joinChannel(2);

        //Open ChannelsApp app. ChannelsApp joins channel 1, then broadcasts both contexts
        await window.fdc3.open("ChannelsApp", channelsAppContext);

        //give listener time to receive context
        wait();
      });

      it("Should not receive context when unsubscribing a user channel before app B broadcasts the listened type to that channel", async () => {
        channelsAppContext.executionComplete = true;

        //listens for when app B execution is complete
        const executionCompleteContext =
          executionCompleteListener("executionComplete");

        //Add two context listeners
        listener = await addContextListener("fdc3.intrument");

        //App A joins channel 1
        await joinChannel(1);

        //unsubscribe from listeners
        if (listener !== undefined) {
          await listener.unsubscribe();
          listener = undefined;
        } else {
          assert.fail("Listener undefined");
        }

        //Open ChannelsApp app. ChannelsApp joins channel 1, then broadcasts both contexts
        window.fdc3.open("ChannelsApp", channelsAppContext);

        await executionCompleteContext;
      });

      it("Should not receive context when joining two different user channels before app B broadcasts the listened type to the first channel that was joined", async () => {
        channelsAppContext.executionComplete = true;
        
        //listens for when app B execution is complete
        const executionCompleteContext =
          executionCompleteListener("executionComplete");

        //Add two context listeners to app A
        listener = await addContextListener("fdc3.instrument");

        //App A joins a channel and then joins another
        await joinChannel(1);
        await joinChannel(2);

        //Open ChannelsApp app. ChannelsApp joins channel 1, then broadcasts both contexts
        window.fdc3.open("ChannelsApp", channelsAppContext);

        await executionCompleteContext;
      });

      it("Should not receive context when joining and then leaving a user channel before app B broadcasts the listened type to the same channel", async () => {
        //Add two context listeners to app A
        listener = await addContextListener("fdc3.instrument");

        //App A joins channel 1
        await joinChannel(1);

        //App A leaves channel 1
        await window.fdc3.leaveCurrentChannel();

        //App B joins channel 1, then broadcasts both contexts
        window.fdc3.open("ChannelsApp", channelsAppContext);

        //give listener time to receive context
        wait();
      });

      it("Should throw NOT DELIVERED error when system broadcast is sent with an invalid Context object structure", async () => {
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
      afterEach(async () => {
        await broadcastAppChannelCloseWindow();
      });

      it("Should receive context when app B broadcasts the listened type to the same app channel", async () => {
        return new Promise(async (resolve) => {
          channelsAppContext.joinAppChannel = true;

          //App A joins app channel
          const testChannel = await window.fdc3.getOrCreateChannel(
            "test-channel"
          );

          //Add context listener to app A
          listener = await testChannel.addContextListener(
            "fdc3.instrument",
            (context) => {
              expect(context.type).to.be.equals("fdc3.instrument");
              resolve();
            }
          );

          assert.isObject(listener);
          expect(typeof listener.unsubscribe).to.be.equals("function");

          //App B joins the same app channel as A then broadcasts context
          await window.fdc3.open("ChannelsApp", channelsAppContext);
        });
      });

      it("Should receive context when app B broadcasts context to an app channel before A joins and listens on the same channel", async () => {
        return new Promise(async (resolve) => {
          channelsAppContext.joinAppChannel = true;

          //App B creates/joins an app channel then broadcasts context
          await window.fdc3.open("ChannelsApp", channelsAppContext);

          wait();

          //App A joins app channel
          const testChannel = await window.fdc3.getOrCreateChannel(
            "test-channel"
          );

          //Add context listener to app A
          listener = await testChannel.addContextListener(
            "fdc3.instrument",
            (context) => {
              expect(context.type).to.be.equals("fdc3.instrument");
              resolve();
            }
          );

          assert.isObject(listener);
          expect(typeof listener.unsubscribe).to.be.equals("function");
        });
      });

      it("Should only receive the relevant listened context when app B broadcasts multiple contexts to the same app channel", async () => {
        return new Promise(async (resolve) => {
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
              expect(context.type).to.be.equals("fdc3.instrument");
              resolve();
            }
          );

          assert.isObject(listener);
          expect(typeof listener.unsubscribe).to.be.equals("function");

          //App B joins the same app channel as A then broadcasts context
          await window.fdc3.open("ChannelsApp", channelsAppContext);
        });
      });

      it("Should receive multiple contexts when app B broadcasts the listened types to the same app channel", async () => {
        return new Promise(async (resolve) => {
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

          assert.isObject(listener);
          expect(typeof listener.unsubscribe).to.be.equals("function");

          //Add a second context listener to app A
          listener = await testChannel.addContextListener(
            "fdc3.contact",
            (context) => {
              contextTypes.push(context.type);
              checkIfBothContextsReceived();
            }
          );

          assert.isObject(listener);
          expect(typeof listener.unsubscribe).to.be.equals("function");

          //App B joins the same app channel as A then broadcasts context
          await window.fdc3.open("ChannelsApp", channelsAppContext);

          function checkIfBothContextsReceived() {
            if (contextTypes.length === 2) {
              if (
                !contextTypes.includes("fdc3.contact") ||
                !contextTypes.includes("fdc3.instrument")
              ) {
                assert.fail("Incorrect context received");
              } else {
                resolve();
              }
            }
          }
        });
      });

      it("Should not receive context when unsubscribing an app channel before app B broadcasts the listened type to that channel", async () => {
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
        listener = await addContextListener("fdc3.instrument", testChannel);

        assert.isObject(listener);
        expect(typeof listener.unsubscribe).to.be.equals("function");

        //Unsubscribe from app channel
        listener.unsubscribe();

        //App B joins the same app channel as A then broadcasts context
        window.fdc3.open("ChannelsApp", channelsAppContext);

        await executionCompleteContext;
      });

      it("Should not receive context when app B broadcasts context to a different app channel", async () => {
        channelsAppContext.joinAppChannel = true;

        //App A joins app channel
        const testChannel = await window.fdc3.getOrCreateChannel(
          "a-different-test-channel"
        );

        //Add context listener to app A
        listener = await addContextListener("fdc3.instrument", testChannel);

        assert.isObject(listener);
        expect(typeof listener.unsubscribe).to.be.equals("function");

        //App B joins the same app channel as A then broadcasts context
        await window.fdc3.open("ChannelsApp", channelsAppContext);

        //give listener time to receive context
        await wait();
      });

      it("Should not receive context when joining two different app channels before app B broadcasts the listened type to the first channel that was joined", async () => {
        channelsAppContext.joinAppChannel = true;

        //App A joins app channel
        let testChannel = await window.fdc3.getOrCreateChannel("test-channel");

        //App A joins different app channel
        testChannel = await window.fdc3.getOrCreateChannel(
          "a-different-test-channel"
        );

        //Add context listener to app A
        listener = await addContextListener("fdc3.instrument", testChannel);

        assert.isObject(listener);
        expect(typeof listener.unsubscribe).to.be.equals("function");

        //App B joins the same app channel as A then broadcasts context
        window.fdc3.open("ChannelsApp", channelsAppContext);

        //give listener time to receive context
        wait();
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

        expect(context.type).to.be.equals("fdc3.instrument");

        const contactContext = await testChannel.getCurrentContext(
          "fdc3.contact"
        );

        expect(contactContext.type).to.be.equals("fdc3.contact");
      });

      it("Should retrieve the last broadcast context item when app B broadcasts a context with multiple history items to the same app channel and A gets current context", async () => {
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

        expect(context.type).to.be.equals("fdc3.instrument");
        expect(context.name).to.be.equals("History-item-2");
      });

      it("Should retrieve the last broadcast context item when app B broadcasts two different contexts to the same app channel and A gets current context", async () => {
        channelsAppContext.joinAppChannel = true;
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

        //App B joins the same app channel as A then broadcasts context
        await window.fdc3.open("ChannelsApp", channelsAppContext);

        await executionCompleteContext;

        //get current context
        const context = await testChannel.getCurrentContext();

        if (context === null) {
          assert.fail("No Context retrieved");
        } else if (context.type === "closeWindow") {
          assert.fail("Did not retrieve last broadcast context from app B");
        } else {
          expect(context.type).to.be.equals("executionComplete");
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

    const addContextListener = async (
      contextType: string,
      channel?: Channel
    ) => {
      let listenerObject: Listener;
      if (channel !== undefined) {
        listenerObject = await channel.addContextListener(
          contextType === null ? null : contextType,
          () => {
            assert.fail(`${contextType} context received`);
          }
        );
      } else {
        listenerObject = await window.fdc3.addContextListener(
          contextType === null ? null : contextType,
          () => {
            assert.fail(`${contextType} context received`);
          }
        );
      }

      assert.isObject(listenerObject);
      expect(typeof listenerObject.unsubscribe).to.be.equals("function");

      return listenerObject;
    };

    async function wait() {
      return new Promise((resolve) => {
        setTimeout(async function () {
          resolve(true);
        }, 3000);
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
      const context = new Promise<Context>(async (resolve) => {
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
      return context;
    };
  });
