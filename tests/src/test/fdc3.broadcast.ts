import { Listener, Channel } from "@finos/fdc3";
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
    };

    const broadcastCloseWindow = async () => {
      await window.fdc3.broadcast({ type: "closeWindow" });
      return new Promise<void>((resolve) => setTimeout(() => resolve(), 1000)); // Wait until close window event is handled
    };

    afterEach(async () => {
      await window.fdc3.getOrCreateChannel("fdc3.raiseIntent");
      await window.fdc3.joinChannel("fdc3.raiseIntent");
      await broadcastCloseWindow();

      if (listener !== undefined) {
        await listener.unsubscribe();
        listener = undefined;
      }

      if (listener2 !== undefined) {
        await listener2.unsubscribe();
        listener2 = undefined;
      }

      await window.fdc3.leaveCurrentChannel();
      channelsAppContext.broadcastMultipleItems,
        channelsAppContext.joinAppChannel,
        channelsAppContext.contextBroadcasts.contact,
        (channelsAppContext.reverseFunctionCallOrder = false);
    });

    it("Method is callable", async () => {
      await window.fdc3.broadcast({
        type: "fdc3.instrument",
        id: { ticker: "AAPL" },
      });
    });

    it("Should throw NOT DELIVERED error when broadcast is sent with an invalid Context object structure", async () => {
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

    describe("User channels", () => {
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
        return new Promise(async (resolve) => {
          //Open ChannelsApp app. ChannelsApp broadcasts context, then joins channel 1
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
        let contextsReceived = 0;
        return new Promise(async (resolve) => {
          channelsAppContext.contextBroadcasts.contact = true;

          //Add context listener to app A
          listener = await window.fdc3.addContextListener(
            "fdc3.instrument",
            (context) => {
              expect(context.type).to.be.equals("fdc3.instrument");
              checkIfBothContextsReceived();
            }
          );

          assert.isObject(listener);
          expect(typeof listener.unsubscribe).to.be.equals("function");

          //Add second context listener to app A
          listener2 = await window.fdc3.addContextListener(
            "fdc3.contact",
            (context) => {
              expect(context.type).to.be.equals("fdc3.contact");
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
            contextsReceived++;
            if (contextsReceived > 1) {
              resolve();
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

        //Give listeners time to receive context
        await wait();
      });

      it("Should not receive context when unsubscribing a user channel before app B broadcasts the listened type to that channel", async () => {
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

        //Give listeners time to receive context
        await wait();
      });

      it("Should not receive context when joining two different user channels before app B broadcasts the listened type to the first channel that was joined", async () => {
        //Add two context listeners to app A
        listener = await addContextListener("fdc3.instrument");

        //App A joins a channel and then joins another
        await joinChannel(1);
        await joinChannel(2);

        //Open ChannelsApp app. ChannelsApp joins channel 1, then broadcasts both contexts
        await window.fdc3.open("ChannelsApp", channelsAppContext);

        //Give listeners time to receive context
        await wait();
      });

      it("Should not receive context when joining and then leaving a user channel before app B broadcasts the listened type to the same channel", async (done) => {
        //Add two context listeners to app A
        //listener = await addContextListener("fdc3.instrument");

        listener = await window.fdc3.addContextListener(
          "fdc3.instrument",
          () => {
            done();
            assert.fail(`"fdc3.instrument" context received`);
          }
        );

        //App A joins channel 1
        await joinChannel(1);

        //App A leaves channel 1
        await window.fdc3.leaveCurrentChannel();

        //App B joins channel 1, then broadcasts both contexts
        await window.fdc3.open("ChannelsApp", channelsAppContext);

        //Give listeners time to receive context
        await wait();
        done();
      });
    });

    describe("App channels", () => {
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
          let contextsReceived = 0;
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
              contextsReceived++;
              checkIfBothContextsReceived();
            }
          );

          assert.isObject(listener);
          expect(typeof listener.unsubscribe).to.be.equals("function");

          //Add a second context listener to app A
          listener = await testChannel.addContextListener(
            "fdc3.contact",
            (context) => {
              expect(context.type).to.be.equals("fdc3.contact");
              contextsReceived++;
              checkIfBothContextsReceived();
            }
          );

          assert.isObject(listener);
          expect(typeof listener.unsubscribe).to.be.equals("function");

          //App B joins the same app channel as A then broadcasts context
          await window.fdc3.open("ChannelsApp", channelsAppContext);

          function checkIfBothContextsReceived() {
            contextsReceived++;
            if (contextsReceived > 1) {
              resolve();
            }
          }
        });
      });

      it("Should not receive context when unsubscribing an app channel before app B broadcasts the listened type to that channel", async () => {
        channelsAppContext.joinAppChannel = true;
        channelsAppContext.contextBroadcasts.contact = true;

        //App A joins app channel
        const testChannel = await window.fdc3.getOrCreateChannel(
          "test-channel"
        );

        //Add context listener to app A
        listener = await addContextListener("fdc3.instrument", testChannel);

        assert.isObject(listener);
        expect(typeof listener.unsubscribe).to.be.equals("function");

        //Unsubscribe from app channel
        listener.unsubscribe();

        //App B joins the same app channel as A then broadcasts context
        await window.fdc3.open("ChannelsApp", channelsAppContext);

        //Give listener time to receive context
        await wait();
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
        await window.fdc3.open("ChannelsApp", channelsAppContext);

        //give listener time to receive context
        await wait();
      });

      it("Should not receive context when joining and then leaving an app channel before app B broadcasts the listened type to the same channel", async () => {
        channelsAppContext.joinAppChannel = true;

        //App A joins app channel
        let testChannel = await window.fdc3.getOrCreateChannel("test-channel");

        //Add context listener to app A
        listener = await addContextListener("fdc3.instrument", testChannel);

        window.fdc3.leaveCurrentChannel();

        assert.isObject(listener);
        expect(typeof listener.unsubscribe).to.be.equals("function");

        //App B joins the same app channel as A then broadcasts context
        await window.fdc3.open("ChannelsApp", channelsAppContext);

        //give listener time to receive context
        await wait();
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
        const instrumentContext = await testChannel.getCurrentContext(
          "fdc3.instrument"
        );

        expect(instrumentContext.type).to.be.equals("fdc3.instrument");

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
        const instrumentContext = await testChannel.getCurrentContext(
          "fdc3.instrument"
        );

        expect(instrumentContext.type).to.be.equals("fdc3.instrument");
        expect(instrumentContext.name).to.be.equals("History-item-2");
      });

      it("Should retrieve the last broadcast context item when app B broadcasts two different contexts to the same app channel and A gets current context", async () => {
        channelsAppContext.joinAppChannel = true;
        channelsAppContext.contextBroadcasts.contact = true;

        //App A joins app channel
        const testChannel = await window.fdc3.getOrCreateChannel(
          "test-channel"
        );

        //App B joins the same app channel as A then broadcasts context
        await window.fdc3.open("ChannelsApp", channelsAppContext);

        //get current context
        const instrumentContext = await testChannel.getCurrentContext();

        expect(instrumentContext.type).to.be.equals("fdc3.contact");
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
      let wait = new Promise((resolve) => {
        setTimeout(async function () {
          resolve(true);
        }, 3000);
      });

      await wait;
    }
  });
