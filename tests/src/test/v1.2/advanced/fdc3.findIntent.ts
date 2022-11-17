import { ResolveError } from "fdc3_1_2";
import { assert, expect } from "chai";
import APIDocumentation from "../../../apiDocuments";
import { DesktopAgent } from "fdc3_1_2/dist/api/DesktopAgent";

declare let fdc3: DesktopAgent;
const findIntentDocs =
  "\r\nDocumentation: " + APIDocumentation.findIntent + "\r\nCause";

/**
 * Details on the mock apps used in these tests can be found in /mock/README.md
 */
export default () =>
  describe("fdc3.findIntent", () => {
    it("(IntentAppD) Should find intent 'aTestingIntent' belonging only to app intent-a", async () => {
      const appIntent = await fdc3.findIntent("aTestingIntent");
      expect(appIntent.intent).to.deep.eq(
        {
          name: "aTestingIntent",
          displayName: "A Testing Intent",
        },
        findIntentDocs
      );
      expect(appIntent.apps).to.have.length(1, findIntentDocs);
      expect(appIntent.apps[0]).to.have.property(
        "name",
        "IntentAppA",
        findIntentDocs
      );
    });

    it("(WrongIntentAppD) Should throw NoAppsFound error when intent does not exist", async () => {
      try {
        await fdc3.findIntent("nonExistentIntent");
        assert.fail("No error was thrown", findIntentDocs);
      } catch (ex) {
        expect(ex).to.have.property(
          "message",
          ResolveError.NoAppsFound,
          findIntentDocs
        );
      }
    });

    it("(IntentAppDRightContext) Should find intent 'aTestingIntent' belonging only to app intent-a with context 'testContextX'", async () => {
      const appIntent = await fdc3.findIntent("aTestingIntent", {
        type: "testContextX",
      });
      expect(appIntent.intent).to.deep.eq(
        {
          name: "aTestingIntent",
          displayName: "A Testing Intent",
        },
        findIntentDocs
      );
      expect(appIntent.apps).to.have.length(1, findIntentDocs);
      expect(appIntent.apps[0]).to.have.property(
        "name",
        "IntentAppA",
        findIntentDocs
      );
    });

    it("(IntentAppDWrongContext) Should throw NoAppsFound error when intent exists but context does not", async () => {
      try {
        await fdc3.findIntent("aTestingIntent", {
          type: "testContextY",
        });
        assert.fail("No error was thrown", findIntentDocs);
      } catch (ex) {
        expect(ex).to.have.property(
          "message",
          ResolveError.NoAppsFound,
          findIntentDocs
        );
      }
    });

    it("(IntentAppDMultiple1) Should find intent 'sharedTestingIntent1' belonging to multiple apps (intent-a & intent-b)", async () => {
      const appIntent = await fdc3.findIntent("sharedTestingIntent1");
      expect(appIntent.intent).to.deep.eq(
        {
          name: "sharedTestingIntent1",
          displayName: "Shared Testing Intent",
        },
        findIntentDocs
      );
      expect(appIntent.apps).to.have.length(2, findIntentDocs);
      expect(appIntent.apps[0]).to.have.property(
        "name",
        "IntentAppA",
        findIntentDocs
      );
      expect(appIntent.apps[1]).to.have.property(
        "name",
        "IntentAppB",
        findIntentDocs
      );
    });

    it("(IntentAppDMultiple2) Should find intent 'sharedTestingIntent1' belonging to multiple apps (intent-a & intent-b) filtered by specific context 'testContextX'", async () => {
      const appIntent = await fdc3.findIntent("sharedTestingIntent1", {
        type: "testContextX",
      });
      expect(appIntent.intent).to.deep.eq(
        {
          name: "sharedTestingIntent1",
          displayName: "Shared Testing Intent",
        },
        findIntentDocs
      );
      expect(appIntent.apps).to.have.length(2, findIntentDocs);
      expect(appIntent.apps[0]).to.have.property(
        "name",
        "IntentAppA",
        findIntentDocs
      );
      expect(appIntent.apps[1]).to.have.property(
        "name",
        "IntentAppB",
        findIntentDocs
      );
    });

    it("(IntentAppDMultiple3) Should find intent 'sharedTestingIntent1' belonging to app 'intent-b' when filtered by specific context 'testContextY'", async () => {
      const appIntent = await fdc3.findIntent("sharedTestingIntent1", {
        type: "testContextY",
      });
      expect(appIntent.intent).to.deep.eq(
        {
          name: "sharedTestingIntent1",
          displayName: "Shared Testing Intent",
        },
        findIntentDocs
      );
      expect(appIntent.apps).to.have.length(1, findIntentDocs);
      expect(appIntent.apps[0]).to.have.property(
        "name",
        "IntentAppB",
        findIntentDocs
      );
    });
  });
