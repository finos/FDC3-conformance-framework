import { ResolveError } from "fdc3_2_0";
import { assert, expect } from "chai";
import { DesktopAgent } from "fdc3_2_0/dist/api/DesktopAgent";
import { APIDocumentation2_0 } from "../apiDocuments-2.0";
import { IntentControl2_0 } from "./raiseIntent-support-2.0";

declare let fdc3: DesktopAgent;
const control = new IntentControl2_0();
const raiseIntentDocs =
  "\r\nDocumentation: " + APIDocumentation2_0.raiseIntent + "\r\nCause";

/**
 * Details on the mock apps used in these tests can be found in /mock/README.md
 */
export default () =>
  describe("fdc3.raiseIntent (NoAppsFound)", () => {
    const RaiseIntentFailedResolve =
      "(RaiseIntentFailedResolve) Should fail to raise intent when targeted app intent-a, context 'testContextY' and intent 'aTestingIntent' do not correlate";
    it(RaiseIntentFailedResolve, async () => {
      try {
        await control.raiseIntent("aTestingIntent", "testContextY");
        assert.fail("No error was thrown");
      } catch (ex) {
        expect(ex, raiseIntentDocs).to.have.property("message", ResolveError.NoAppsFound);
      }
    });

    const RaiseIntentFailTargetedAppResolve1 =
      "(RaiseIntentFailTargetedAppResolve1) Should fail to raise intent when targeted app intent-a, context 'testContextY', intent 'aTestingIntent' and AppIdentifier IntentAppAId do not correlate";
    it(RaiseIntentFailTargetedAppResolve1, async () => {
      try {
        await control.raiseIntent("aTestingIntent", "testContextY", { appId: "IntentAppAId"});
        assert.fail("No error was thrown");
      } catch (ex) {
        expect(ex, raiseIntentDocs).to.have.property("message", ResolveError.NoAppsFound);
      }
    });

    const RaiseIntentFailTargetedAppResolve2 =
      "(RaiseIntentFailTargetedAppResolve2) Should fail to raise intent when targeted app intent-a, context 'testContextY', intent 'aTestingIntent' and AppIdentifier NonExistentApp do not correlate";
    it(RaiseIntentFailTargetedAppResolve2, async () => {
      try {
        await control.raiseIntent("aTestingIntent", "testContextY", { appId: "NonExistentApp"});
        assert.fail("No error was thrown");
      } catch (ex) {
        expect(ex, raiseIntentDocs).to.have.property("message", ResolveError.NoAppsFound);
      }
    });

    //To Do: Test will need an extended timeout to allow for this to be returned in time by the desktop agent, which will have a vendor-defined timeout.
    const RaiseIntentFailTargetedAppResolve3 =
      "(RaiseIntentFailTargetedAppResolve3) Should fail to raise intent when targeted app intent-h, context 'testContextY', intent 'sharedTestingIntent2' and AppIdentifier IntentAppHId do not correlate";
    it(RaiseIntentFailTargetedAppResolve3, async () => {
      try {
        await control.raiseIntent("sharedTestingIntent2", "testContextY", { appId: "NonExistentApp"});
        assert.fail("No error was thrown");
      } catch (ex) {
        expect(ex, raiseIntentDocs).to.have.property("message", ResolveError.NoAppsFound);
      }
    });

    //To Do: Test will need an extended timeout to allow for this to be returned in time by the desktop agent, which will have a vendor-defined timeout.
    const RaiseIntentFailTargetedAppResolve4 =
      "(RaiseIntentFailTargetedAppResolve4) Should fail to raise intent when targeted app intent-i, context 'testContextY', intent 'sharedTestingIntent2' and AppIdentifier IntentAppIId do not correlate";
    it(RaiseIntentFailTargetedAppResolve4, async () => {
      try {
        await control.raiseIntent("sharedTestingIntent2", "testContextY", { appId: "IntentAppIId"});
        assert.fail("No error was thrown");
      } catch (ex) {
        expect(ex, raiseIntentDocs).to.have.property("message", ResolveError.NoAppsFound);
      }
    });

    const RaiseIntentFailTargetedAppInstanceResolve1 =
      "(RaiseIntentFailTargetedAppInstanceResolve1) Should fail to raise intent when targeted app intent-a instance, context 'testContextY', intent 'aTestingIntent' and AppIdentifier IntentAppAId do not correlate";
    it(RaiseIntentFailTargetedAppInstanceResolve1, async () => {
      try {
        const appIdentifier = await control.openIntentApp("IntentAppAId");
        await control.raiseIntent("aTestingIntent", "testContextY", appIdentifier);
        assert.fail("No error was thrown");
      } catch (ex) {
        expect(ex, raiseIntentDocs).to.have.property("message", ResolveError.NoAppsFound);
      }
    });

    const RaiseIntentFailTargetedAppInstanceResolve2 =
      "(RaiseIntentFailTargetedAppInstanceResolve2) Should fail to raise intent when targeted app intent-a, context 'testContextY', intent 'aTestingIntent' and AppIdentifier IntentAppAId with instanceId property NonExistentInstanceId do not correlate";
    it(RaiseIntentFailTargetedAppInstanceResolve2, async () => {
      try {
        await control.raiseIntent("aTestingIntent", "testContextY", { appId: "IntentAppAId", instanceId: "NonExistentInstanceId" });
        assert.fail("No error was thrown");
      } catch (ex) {
        expect(ex).to.have.property("message", ResolveError.NoAppsFound);
      }
    });
  });
