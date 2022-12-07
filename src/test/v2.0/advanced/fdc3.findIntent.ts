import { ResolveError } from "fdc3_2_0";
import { assert, expect } from "chai";
import { APIDocumentation2_0 } from "../apiDocuments-2.0";
import { DesktopAgent } from "fdc3_2_0/dist/api/DesktopAgent";

declare let fdc3: DesktopAgent;
const findIntentDocs =
  "\r\nDocumentation: " + APIDocumentation2_0.findIntent + "\r\nCause";

/**
 * Details on the mock apps used in these tests can be found in /mock/README.md
 */
export default () =>
  describe("fdc3.findIntent", () => {
    it("(2.0-FindIntentAppD) Should find intent 'aTestingIntent' belonging only to app intent-a", async () => {
      const appIntent = await fdc3.findIntent("aTestingIntent");
      expect(appIntent.intent).to.deep.eq(
        {
          name: "aTestingIntent",
          displayName: "A Testing Intent",
        },
        findIntentDocs
      );
      expect(appIntent.apps, "Unexpected AppIntent.apps.length").to.have.length(
        1,
        findIntentDocs
      );
      expect(appIntent.apps[0]).to.have.property(
        "appId",
        "IntentAppAId",
        findIntentDocs
      );
    });

    it("(2.0-FindNonExistentIntentAppD) Should throw NoAppsFound error when intent does not exist", async () => {
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

    it("(2.0-FindIntentAppDRightContext) Should find intent 'aTestingIntent' belonging only to app intent-a with context 'testContextX'", async () => {
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
      expect(appIntent.apps, "Unexpected AppIntent.apps.length").to.have.length(
        1,
        findIntentDocs
      );
      expect(appIntent.apps[0]).to.have.property(
        "appId",
        "IntentAppAId",
        findIntentDocs
      );
    });

    it("(2.0-FindIntentAppDWrongContext) Should throw NoAppsFound error when intent exists but context does not", async () => {
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

    it("(2.0-FindIntentAppDMultiple1) Should find intent 'sharedTestingIntent2' belonging to multiple apps (intent-a & intent-b)", async () => {
      const appIntent = await fdc3.findIntent("sharedTestingIntent2");
      expect(appIntent.intent).to.deep.eq(
        {
          name: "sharedTestingIntent2",
          displayName: "Shared Testing Intent",
        },
        findIntentDocs
      );
      expect(appIntent.apps, "Unexpected AppIntent.apps.length").to.have.length(
        6,
        findIntentDocs
      );
      expect(appIntent.apps[0]).to.have.property(
        "appId",
        "IntentAppDId",
        findIntentDocs
      );
      expect(appIntent.apps[1]).to.have.property(
        "appId",
        "IntentAppEId",
        findIntentDocs
      );
      expect(appIntent.apps[2]).to.have.property(
        "appId",
        "IntentAppFId",
        findIntentDocs
      );
      expect(appIntent.apps[3]).to.have.property(
        "appId",
        "IntentAppGId",
        findIntentDocs
      );
      expect(appIntent.apps[4]).to.have.property(
        "appId",
        "IntentAppHId",
        findIntentDocs
      );
      expect(appIntent.apps[5]).to.have.property(
        "appId",
        "IntentAppIId",
        findIntentDocs
      );
    });

    it("(IntentAppDMultiple2) Should find intent 'sharedTestingIntent1' belonging to multiple apps (intent-a & intent-b) filtered by specific context 'testContextX'", async () => {
      const appIntent = await fdc3.findIntent("sharedTestingIntent2", {
        type: "testContextY",
      });
      expect(appIntent.intent).to.deep.eq(
        {
          name: "sharedTestingIntent2",
          displayName: "Shared Testing Intent",
        },
        findIntentDocs
      );
      expect(appIntent.apps, "Unexpected AppIntent.apps.length").to.have.length(
        6,
        findIntentDocs
      );
      expect(appIntent.apps[0]).to.have.property(
        "appId",
        "IntentAppDId",
        findIntentDocs
      );
      expect(appIntent.apps[1]).to.have.property(
        "appId",
        "IntentAppEId",
        findIntentDocs
      );
      expect(appIntent.apps[2]).to.have.property(
        "appId",
        "IntentAppFId",
        findIntentDocs
      );
      expect(appIntent.apps[3]).to.have.property(
        "appId",
        "IntentAppGId",
        findIntentDocs
      );
      expect(appIntent.apps[4]).to.have.property(
        "appId",
        "IntentAppHId",
        findIntentDocs
      );
      expect(appIntent.apps[5]).to.have.property(
        "appId",
        "IntentAppIId",
        findIntentDocs
      );
    });

    it("(2.0-FindIntentAppDByResultSingle) Should find intent 'cTestingIntent' belonging only to app intent-c with context 'testContextX' and result type 'testContextZ'", async () => {
      const appIntent = await fdc3.findIntent(
        "cTestingIntent",
        {
          type: "testContextX",
        },
        "testContextZ"
      );
      expect(appIntent.intent).to.deep.eq(
        {
          name: "cTestingIntent",
          displayName: "C Testing Intent",
        },
        findIntentDocs
      );
      expect(appIntent.apps, "Unexpected AppIntent.apps.length").to.have.length(
        1,
        findIntentDocs
      );
      expect(appIntent.apps[0]).to.have.property(
        "appId",
        "IntentAppCId",
        findIntentDocs
      );
    });

    it("(2.0-FindIntentAppDByResultSingleNullContext) Should find intent 'cTestingIntent' belonging only to app intent-c with a null context and result type 'testContextZ'", async () => {
      const appIntent = await fdc3.findIntent(
        "cTestingIntent",
        undefined,
        "testContextZ"
      );
      expect(appIntent.intent).to.deep.eq(
        {
          name: "cTestingIntent",
          displayName: "C Testing Intent",
        },
        findIntentDocs
      );
      expect(appIntent.apps, "Unexpected AppIntent.apps.length").to.have.length(
        1,
        findIntentDocs
      );
      expect(appIntent.apps[0]).to.have.property(
        "appId",
        "IntentAppCId",
        findIntentDocs
      );
    });

    it("(2.0-FindIntentAppDByResultMultiple) Should find intent 'sharedTestingIntent1' belonging only to app intent-b with context 'testContextX' and result type 'testContextY'", async () => {
      const appIntent = await fdc3.findIntent(
        "sharedTestingIntent1",
        { type: "testContextX" },
        "testContextY"
      );
      expect(appIntent.intent).to.deep.eq(
        {
          name: "sharedTestingIntent1",
          displayName: "Shared Testing Intent",
        },
        findIntentDocs
      );
      expect(appIntent.apps, "Unexpected AppIntent.apps.length").to.have.length(
        2,
        findIntentDocs
      );
      expect(appIntent.apps[0]).to.have.property(
        "appId",
        "IntentAppAId",
        findIntentDocs
      );
      expect(appIntent.apps[1]).to.have.property(
        "appId",
        "IntentAppBId",
        findIntentDocs
      );
    });

    it("(2.0-FindIntentAppDByResultChannel1) Should find intent 'sharedTestingIntent2' belonging only to apps intent-e and itent-f with context 'testContextY' and result type 'channel", async () => {
      const appIntent = await fdc3.findIntent(
        "sharedTestingIntent2",
        { type: "testContextY" },
        "channel"
      );
      expect(appIntent.intent).to.deep.eq(
        {
          name: "sharedTestingIntent2",
          displayName: "Shared Testing Intent",
        },
        findIntentDocs
      );
      expect(appIntent.apps, "Unexpected AppIntent.apps.length").to.have.length(
        2,
        findIntentDocs
      );
      expect(appIntent.apps[0]).to.have.property(
        "appId",
        "IntentAppEId",
        findIntentDocs
      );

      expect(appIntent.apps[1]).to.have.property(
        "appId",
        "IntentAppFId",
        findIntentDocs
      );
    });

    it("(2.0-FindIntentAppDByResultChannel2) Should find intent 'sharedTestingIntent2' belonging only to app intent-c with context 'testContextY' and result type 'channel<testContextZ>'", async () => {
      const appIntent = await fdc3.findIntent(
        "sharedTestingIntent2",
        { type: "testContextY" },
        "channel<testContextZ>"
      );
      expect(appIntent.intent).to.deep.eq(
        {
          name: "sharedTestingIntent2",
          displayName: "Shared Testing Intent",
        },
        findIntentDocs
      );
      expect(appIntent.apps, "Unexpected AppIntent.apps.length").to.have.length(
        1,
        findIntentDocs
      );
      expect(appIntent.apps[0]).to.have.property(
        "appId",
        "IntentAppFId",
        findIntentDocs
      );
    });
  });
