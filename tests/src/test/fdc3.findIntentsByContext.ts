import { ResolveError } from "@finos/fdc3";
import { expect } from "chai";

export default () =>
  describe("fdc3.findIntentsByContext", () => {
    it("Should find intents by context 'testContextX'", async () => {
      const intents = await window.fdc3.findIntentsByContext({
        type: "testContextX",
      });
      expect(intents).to.have.length(3);

      const intentNames = intents.map((appIntent) => appIntent.intent.name);
      expect(intentNames).to.have.all.members([
        "aTestingIntent",
        "sharedTestingIntent1",
        "cTestingIntent",
      ]);

      const aTestingIntent = intents.find(
        (appIntent) => appIntent.intent.name === "aTestingIntent"
      );
      expect(aTestingIntent.apps).to.have.length(1);
      expect(aTestingIntent.apps[0].name).to.eq("IntentAppAId");

      const sharedTestingIntent1 = intents.find(
        (appIntent) => appIntent.intent.name === "sharedTestingIntent1"
      );
      expect(sharedTestingIntent1.apps).to.have.length(2);
      const sharedAppNames = sharedTestingIntent1.apps.map((app) => app.name);
      expect(sharedAppNames).to.have.all.members([
        "IntentAppAId",
        "IntentAppBId",
      ]);

      const cTestingIntent = intents.find(
        (appIntent) => appIntent.intent.name === "cTestingIntent"
      );
      expect(cTestingIntent.apps).to.have.length(1);
      expect(cTestingIntent.apps[0].name).to.eq("IntentAppCId");
    });

    it("Should throw NoAppsFound error when context does not exist", async () => {
      try {
        await window.fdc3.findIntentsByContext({
          type: "testContextNonExistent",
        });
      } catch (ex) {
        expect(ex.message).to.eq(ResolveError.NoAppsFound);
      }
    });
  });
