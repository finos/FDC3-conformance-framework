import { ResolveError } from "fdc3_2_0";
import { assert, expect } from "chai";
import { DesktopAgent } from "fdc3_2_0/dist/api/DesktopAgent";
import { APIDocumentation2_0 } from "../apiDocuments-2.0";
import { IntentApp, RaiseIntentControl2_0 } from "./intent-support-2.0";
import constants from "../../../constants";
import { sleep, wrapPromise } from "../../../utils";

declare let fdc3: DesktopAgent;
const control = new RaiseIntentControl2_0();
const raiseIntentDocs = "\r\nDocumentation: " + APIDocumentation2_0.raiseIntent + "\r\nCause";

/**
 * Details on the mock apps used in these tests can be found in /mock/README.md
 */
export default () =>
  describe("fdc3.raiseIntent (NoAppsFound)", () => {
    const RaiseIntentFailedResolve = "(RaiseIntentFailedResolve) Should fail to raise intent when targeted app intent-a, context 'testContextY' and intent 'aTestingIntent' do not correlate";
    it(RaiseIntentFailedResolve, async () => {
      try {
        await control.raiseIntent("aTestingIntent", "testContextY");
        assert.fail("No error was thrown");
      } catch (ex) {
        expect(ex, raiseIntentDocs).to.have.property("message", ResolveError.NoAppsFound);
      }
    });

    const RaiseIntentFailTargetedAppInstanceResolve1 =
      "(RaiseIntentFailTargetedAppInstanceResolve1) Should fail to raise intent when targeted app intent-a instance, context 'testContextY', intent 'aTestingIntent' and AppIdentifier IntentAppAId do not correlate";
    it(RaiseIntentFailTargetedAppInstanceResolve1, async () => {
      try {
        const appIdentifier = await control.openIntentApp(IntentApp.IntentAppA);
        await control.raiseIntent("aTestingIntent", "testContextY", appIdentifier);
        assert.fail("No error was thrown");
      } catch (ex) {
        expect(ex, raiseIntentDocs).to.have.property("message", ResolveError.IntentDeliveryFailed);
      }
    });

    const RaiseIntentFailTargetedAppInstanceResolve2 =
      "(RaiseIntentFailTargetedAppInstanceResolve2) Should fail to raise intent when targeted app intent-a, context 'testContextY', intent 'aTestingIntent' and AppIdentifier IntentAppAId with instanceId property NonExistentInstanceId do not correlate";
    it(RaiseIntentFailTargetedAppInstanceResolve2, async () => {
      try {
        await control.raiseIntent("aTestingIntent", "testContextY", {
          appId: "IntentAppAId",
          instanceId: "NonExistentInstanceId",
        });
        assert.fail("No error was thrown");
      } catch (ex) {
        expect(ex).to.have.property("message", ResolveError.NoAppsFound);
      }
    });

    const RaiseIntentFailTargetedAppResolve1 = "(RaiseIntentFailTargetedAppResolve1) Should fail to raise intent when targeted app intent-a, context 'testContextY', intent 'aTestingIntent' and AppIdentifier IntentAppAId do not correlate";
    it(RaiseIntentFailTargetedAppResolve1, async () => {
      try {
        await control.raiseIntent("aTestingIntent", "testContextY", { appId: "IntentAppAId" });
        assert.fail("No error was thrown");
      } catch (ex) {
        expect(ex, raiseIntentDocs).to.have.property("message", ResolveError.NoAppsFound);
      }
    });

    const RaiseIntentFailTargetedAppResolve2 = "(RaiseIntentFailTargetedAppResolve2) Should fail to raise intent when targeting non-existant app id, context 'testContextY', intent 'aTestingIntent' and throw TargetAppUnavailable error";
    it(RaiseIntentFailTargetedAppResolve2, async () => {
      try {
        await control.raiseIntent("aTestingIntent", "testContextY", { appId: "NonExistentApp" });
        assert.fail("No error was thrown");
      } catch (ex) {
        expect(ex, raiseIntentDocs).to.have.property("message", ResolveError.TargetAppUnavailable);
      }
    });

    const RaiseIntentFailTargetedAppResolve3 = "(RaiseIntentFailTargetedAppResolve3) Should fail to raise intent when targeting a non-existant app id, context 'testContextY', intent 'sharedTestingIntent2' and throw IntentDeliveryFailed error";
    it(RaiseIntentFailTargetedAppResolve3, async () => {
      const { timeout, promise } = sleep(constants.NoListenerTimeout);

      try {
        await control.raiseIntent("sharedTestingIntent2", "testContextY", { appId: "NonExistentApp" });
        await promise;
        assert.fail("No error was thrown");
      } catch (ex) {
        clearTimeout(timeout);
        expect(ex, raiseIntentDocs).to.have.property("message", ResolveError.IntentDeliveryFailed);
      }
    }).timeout(constants.NoListenerTimeout + 1000);

    const RaiseIntentFailTargetedAppResolve4 = "(RaiseIntentFailTargetedAppResolve4) Should throw an IntentDeliveryFailed error when raising intent with targeted app intent-i, context 'testContextY', intent 'sharedTestingIntent2'";
    it(RaiseIntentFailTargetedAppResolve4, async () => {
      const { timeout, promise } = sleep(constants.NoListenerTimeout);

      try {
        await control.raiseIntent("sharedTestingIntent2", "testContextY", { appId: IntentApp.IntentAppI });
        await promise;
        assert.fail("No error was thrown");
      } catch (ex) {
        clearTimeout(timeout);
        expect(ex, raiseIntentDocs).to.have.property("message", ResolveError.IntentDeliveryFailed);
      }
    }).timeout(constants.NoListenerTimeout + 1000);
  });
