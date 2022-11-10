import { ResolveError } from "fdc3_1_2";
import { assert, expect } from "chai";
import APIDocumentation from "../../../apiDocuments";
import { DesktopAgent } from "fdc3_1_2/dist/api/DesktopAgent";

const findIntentsByContextDocs =
  "\r\nDocumentation: " + APIDocumentation.findIntentsByContext + "\r\nCause";

/**
 * Details on the mock apps used in these tests can be found in /mock/README.md
 */
export default () =>
  describe("fdc3.findIntentsByContext", () => {
    it("(SingleContext) Should find intents by context 'testContextX'", async () => {
      try {
        const intents = await (<DesktopAgent>(
          (<unknown>window.fdc3)
        )).findIntentsByContext({
          type: "testContextX",
        });
        expect(intents).to.have.length(3, findIntentsByContextDocs);

        const intentNames = intents.map((appIntent) => appIntent.intent.name);
        expect(intentNames).to.have.all.members(
          ["aTestingIntent", "sharedTestingIntent1", "cTestingIntent"],
          findIntentsByContextDocs
        );

        const aTestingIntent = intents.find(
          (appIntent) => appIntent.intent.name === "aTestingIntent"
        );
        expect(aTestingIntent.apps).to.have.length(1, findIntentsByContextDocs);
        expect(aTestingIntent.apps[0].name).to.eq(
          "IntentAppAId",
          findIntentsByContextDocs
        );

        const sharedTestingIntent1 = intents.find(
          (appIntent) => appIntent.intent.name === "sharedTestingIntent1"
        );
        expect(sharedTestingIntent1.apps).to.have.length(
          2,
          findIntentsByContextDocs
        );
        const sharedAppNames = sharedTestingIntent1.apps.map((app) => app.name);
        expect(sharedAppNames).to.have.all.members(
          ["IntentAppAId", "IntentAppBId"],
          findIntentsByContextDocs
        );

        const cTestingIntent = intents.find(
          (appIntent) => appIntent.intent.name === "cTestingIntent"
        );
        expect(cTestingIntent.apps).to.have.length(1, findIntentsByContextDocs);
        expect(cTestingIntent.apps[0].name).to.eq(
          "IntentAppCId",
          findIntentsByContextDocs
        );
      } catch (ex) {
        assert.fail(findIntentsByContextDocs + (ex.message ?? ex));
      }
    });

    it("(NoContext) Should throw NoAppsFound error when context does not exist", async () => {
      try {
        await (<DesktopAgent>(<unknown>window.fdc3)).findIntentsByContext({
          type: "testContextNonExistent",
        });
      } catch (ex) {
        expect(ex).to.have.property(
          "message",
          ResolveError.NoAppsFound,
          findIntentsByContextDocs
        );
      }
    });
  });
