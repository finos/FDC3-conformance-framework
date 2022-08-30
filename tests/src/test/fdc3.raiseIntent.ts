import { Context, ResolveError } from "@finos/fdc3";
import { assert, expect } from "chai";

// creates a channel and subscribes for broadcast contexts. This is
// used by the 'mock app' to send messages back to the test runner for validation
const createReceiver = (contextType: string) => {
  const messageReceived = new Promise<Context>(async (resolve) => {
    const listener = await window.fdc3.addContextListener(
      contextType,
      (context) => {
        resolve(context);
        listener.unsubscribe();
      }
    );
  });

  return messageReceived;
};

export default () =>
  describe("fdc3.raiseIntent", () => {
    before(async () => {
      await window.fdc3.getOrCreateChannel("fdc3.raiseIntent");
      await window.fdc3.joinChannel("fdc3.raiseIntent");
    });

    const broadcastCloseWindow = async () => {
      await window.fdc3.broadcast({ type: "closeWindow" });
      return new Promise<void>((resolve) => setTimeout(() => resolve(), 1000)); // Wait until close window event is handled
    };

    beforeEach(async () => {
      await broadcastCloseWindow();
    });

    afterEach(async () => {
      await broadcastCloseWindow();
    });

    it("Should start app B when raising intent 'sharedTestingIntent1' with context 'testContextY'", async () => {
      const result = createReceiver("fdc3-intent-b-opened");
      const intentResolution = await window.fdc3.raiseIntent(
        "sharedTestingIntent1",
        {
          type: "testContextY",
        }
      );

      expect(intentResolution.source).to.eq("IntentAppBId");
      await result;
    });

    it("Should start app A when targeted by raising intent 'aTestingIntent' with context 'testContextX'", async () => {
      const result = createReceiver("fdc3-intent-a-opened");
      const intentResolution = await window.fdc3.raiseIntent(
        "aTestingIntent",
        {
          type: "testContextX",
        },
        "IntentAppA"
      );
      expect(intentResolution.source).to.eq("IntentAppAId");
      await result;
    });

    it("Should start app A when targeted (name and appId) by raising intent 'aTestingIntent' with context 'testContextX'", async () => {
      const result = createReceiver("fdc3-intent-a-opened");
      const intentResolution = await window.fdc3.raiseIntent(
        "aTestingIntent",
        {
          type: "testContextX",
        },
        { name: "IntentAppA", appId: "IntentAppAId" }
      );
      expect(intentResolution.source).to.eq("IntentAppAId");
      await result;
    });

    it("Should start app A when targeted (name) by raising intent 'aTestingIntent' with context 'testContextX'", async () => {
      const result = createReceiver("fdc3-intent-a-opened");
      const intentResolution = await window.fdc3.raiseIntent(
        "aTestingIntent",
        {
          type: "testContextX",
        },
        { name: "IntentAppA" }
      );
      expect(intentResolution.source).to.eq("IntentAppAId");
      await result;
    });

    it("Should fail to raise intent when targeted app 'IntentAppA', context 'testContextY' and intent 'aTestingIntent' do not correlate", async () => {
      try {
        await window.fdc3.raiseIntent(
          "aTestingIntent",
          {
            type: "testContextY",
          },
          "IntentAppA"
        );
        assert.fail("Error was not thrown");
      } catch (ex) {
        expect(ex.message).to.eq(ResolveError.NoAppsFound);
      }
    });

    it("Should fail to raise intent when targeted app 'IntentAppA' (name and appId), context 'testContextY' and intent 'aTestingIntent' do not correlate", async () => {
      try {
        await window.fdc3.raiseIntent(
          "aTestingIntent",
          {
            type: "testContextY",
          },
          { name: "IntentAppA", appId: "IntentAppAId" }
        );
        assert.fail("Error was not thrown");
      } catch (ex) {
        expect(ex.message).to.eq(ResolveError.NoAppsFound);
      }
    });

    it("Should fail to raise intent when targeted app 'IntentAppA' (name), context 'testContextY' and intent 'aTestingIntent' do not correlate", async () => {
      try {
        await window.fdc3.raiseIntent(
          "aTestingIntent",
          {
            type: "testContextY",
          },
          { name: "IntentAppA" }
        );
        assert.fail("Error was not thrown");
      } catch (ex) {
        expect(ex.message).to.eq(ResolveError.NoAppsFound);
      }
    });

    it("Should fail to raise intent when targeted app 'IntentAppC', context 'testContextX' and intent 'aTestingIntent' do not correlate", async () => {
      try {
        await window.fdc3.raiseIntent(
          "aTestingIntent",
          {
            type: "testContextX",
          },
          "IntentAppC"
        );
        assert.fail("Error was not thrown");
      } catch (ex) {
        expect(ex.message).to.eq(ResolveError.NoAppsFound);
      }
    });
  });
