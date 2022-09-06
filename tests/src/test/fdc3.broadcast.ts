import { ResolveError, Listener } from "@finos/fdc3";
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
    };

    afterEach(async () => {
      if (listener !== undefined) {
        await listener.unsubscribe();
        listener = undefined;
      }

      if (listener2 !== undefined) {
        await listener2.unsubscribe();
        listener2 = undefined;
      }

      await window.fdc3.leaveCurrentChannel();
      channelsAppContext.reverseFunctionCallOrder = false;
      channelsAppContext.contextBroadcasts.contact = false;
    });

    it("Method is callable", async () => {
      await window.fdc3.broadcast({
        type: "fdc3.instrument",
        id: { ticker: "AAPL" },
      });
    });

    it("App A adds context listener then joins channel 1 => App B joins channel 1 then broadcasts context => App A receives context from B", async () => {
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

    it("App A joins channel 1 then adds context listener => App B joins channel 1 then broadcasts context => App A receives context", async () => {
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

    it("App B joins channel 1 then broadcasts context => App A joins channel 1 => App A adds context listener then receives context from B", async () => {
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

    it("App B broadcasts context then joins channel 1 => App A joins channel 1 => App A adds context listener then receives context from B", async () => {
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

    it("App A adds instrument context listener => App A and B join channel 1 => App B broadcasts two contexts => App A receives the instrument context from B", async () => {
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

    it("App A adds two context listeners => App A and B join channel 1 => App B broadcasts two contexts => App A receives both contexts from B", async () => {
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

    it("App A adds two context listeners => App A and B join different channels => App B broadcasts two contexts => App A doesn't receive any context", async () => {
      channelsAppContext.contextBroadcasts.contact = true;

      //Add two context listeners to app A
      listener = await addContextListener(listener, "fdc3.instrument");
      listener2 = await addContextListener(listener2, "fdc3.contact");
      //App A joins channel 2
      await joinChannel(2);
      //Open ChannelsApp app. ChannelsApp joins channel 1, then broadcasts both contexts
      await window.fdc3.open("ChannelsApp", channelsAppContext);

      //Give listeners time to receive context
      await wait();
    });

    it("App A adds two context listeners => App A and B join the same channel => App A unsubscribes listeners => App B broadcasts two contexts => App A doesn't receive any context", async () => {
      channelsAppContext.contextBroadcasts.contact = true;

      //Add two context listeners
      listener = await addContextListener(listener, "fdc3.intrument");
      listener2 = await addContextListener(listener2, "fdc3.contact");

      //App A joins channel 1
      await joinChannel(1);

      //unsubscribe from listeners
      if (listener !== undefined) {
        await listener.unsubscribe();
        listener = undefined;
      } else {
        assert.fail("Listener undefined");
      }
      if (listener2 !== undefined) {
        await listener2.unsubscribe();
        listener2 = undefined;
      } else {
        assert.fail("Listener undefined");
      }

      //Open ChannelsApp app. ChannelsApp joins channel 1, then broadcasts both contexts
      window.fdc3.open("ChannelsApp", channelsAppContext);

      //Give listeners time to receive context
      await wait();
    });

    it("App A adds two context listeners => App A joins channel 1 then joins channel 2 => App B joins channel 1 then broadcasts two contexts => App A doesn't receive any context", async () => {
      channelsAppContext.contextBroadcasts.contact = true;

      //Add two context listeners to app A
      listener = await addContextListener(listener, "fdc3.instrument");
      listener2 = await addContextListener(listener2, "fdc3.contact");

      //App A joins a channel and then joins another
      await joinChannel(1);
      await joinChannel(2);

      //Open ChannelsApp app. ChannelsApp joins channel 1, then broadcasts both contexts
      await window.fdc3.open("ChannelsApp", channelsAppContext);

      //Give listeners time to receive context
      await wait();
    });

    it("App A adds two context listeners => App A joins and then leaves channel 1 => App B joins channel 1 and broadcasts two contexts => App A doesn't receive any context", async () => {
      channelsAppContext.contextBroadcasts.contact = true;

      //Add two context listeners to app A
      listener = await addContextListener(listener, "fdc3.instrument");
      listener2 = await addContextListener(listener2, "fdc3.contact");

      //App A joins channel 1
      await joinChannel(1);

      //App A leaves channel 1
      await window.fdc3.leaveCurrentChannel();

      //App B joins channel 1, then broadcasts both contexts
      await window.fdc3.open("ChannelsApp", channelsAppContext);

      //Give listeners time to receive context
      await wait();
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
      listenerObject: Listener,
      contextType: string
    ) => {
      listenerObject = await window.fdc3.addContextListener(
        contextType === null ? null : contextType,
        (context) => {
          if (context.type === contextType) {
            assert.fail(`${contextType} context received`);
          }
        }
      );

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
