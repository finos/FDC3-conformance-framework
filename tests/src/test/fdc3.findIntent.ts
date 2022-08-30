import { ResolveError } from "@finos/fdc3";
import { assert, expect } from "chai";

export default () =>
  describe("fdc3.findIntent", () => {
    it("Should find intent belonging only to app A", async () => {
      const appIntent = await window.fdc3.findIntent("aTestingIntent");
      expect(appIntent.intent).to.deep.eq({
        name: "aTestingIntent",
        displayName: "A Testing Intent",
      });
      expect(appIntent.apps).to.have.length(1);
      expect(appIntent.apps[0]).to.have.property("appId", "IntentAppAId");
    });

    it("Should throw NoAppsFound error when intent does not exist", async () => {
      try {
        await window.fdc3.findIntent("nonExistentIntent");
        assert.fail("No error was thrown");
      } catch (ex) {
        expect(ex.message).to.eq(ResolveError.NoAppsFound);
      }
    });

    it("Should find intent belonging only to app A with context", async () => {
      const appIntent = await window.fdc3.findIntent("aTestingIntent", {
        type: "testContextX",
      });
      expect(appIntent.intent).to.deep.eq({
        name: "aTestingIntent",
        displayName: "A Testing Intent",
      });
      expect(appIntent.apps).to.have.length(1);
      expect(appIntent.apps[0]).to.have.property("appId", "IntentAppAId");
    });

    it("Should throw NoAppsFound error when intent exists but context does not", async () => {
      try {
        await window.fdc3.findIntent("aTestingIntent", {
          type: "testContextY",
        });
        assert.fail("No error was thrown");
      } catch (ex) {
        expect(ex.message).to.eq(ResolveError.NoAppsFound);
      }
    });

    it("Should find intent belonging to multiple apps (A & B)", async () => {
      const appIntent = await window.fdc3.findIntent("sharedTestingIntent1");
      expect(appIntent.intent).to.deep.eq({
        name: "sharedTestingIntent1",
        displayName: "Shared Testing Intent",
      });
      expect(appIntent.apps).to.have.length(2);
      expect(appIntent.apps[0]).to.have.property("appId", "IntentAppAId");
      expect(appIntent.apps[1]).to.have.property("appId", "IntentAppBId");
    });

    it("Should find intent belonging to multiple apps (A & B) filtered by specific context 'testContextX'", async () => {
      const appIntent = await window.fdc3.findIntent("sharedTestingIntent1", {
        type: "testContextX",
      });
      expect(appIntent.intent).to.deep.eq({
        name: "sharedTestingIntent1",
        displayName: "Shared Testing Intent",
      });
      expect(appIntent.apps).to.have.length(2);
      expect(appIntent.apps[0]).to.have.property("appId", "IntentAppAId");
      expect(appIntent.apps[1]).to.have.property("appId", "IntentAppBId");
    });

    it('Should find intent belonging to multiple apps (B) filtered by specific context "testContextY"', async () => {
      const appIntent = await window.fdc3.findIntent("sharedTestingIntent1", {
        type: "testContextY",
      });
      expect(appIntent.intent).to.deep.eq({
        name: "sharedTestingIntent1",
        displayName: "Shared Testing Intent",
      });
      expect(appIntent.apps).to.have.length(1);
      expect(appIntent.apps[0]).to.have.property("appId", "IntentAppBId");
    });
  });
