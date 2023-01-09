import { ChannelError, PrivateChannel } from "fdc3_2_0";
import { assert, expect } from "chai";
import { wait } from "../../../utils";
import { RaiseIntentControl2_0, IntentResultType, IntentApp } from "../support/intent-support-2.0";
import constants from "../../../constants";
import { closeMockAppWindow } from "../fdc3-2_0-utils";

const control = new RaiseIntentControl2_0();

/**
 * Details on the mock apps used in these tests can be found in /mock/README.md
 */
export default () =>
  describe("fdc3.raiseIntent", () => {
    afterEach(async function afterEach() {
      await closeMockAppWindow(this.currentTest.title);
    });

    const RaiseIntentSingleResolve = "(2.0-RaiseIntentSingleResolve) Should start app intent-a when raising intent 'aTestingIntent1' with context 'testContextX'";
    it(RaiseIntentSingleResolve, async () => {
      await control.listenForError();
      const result = control.receiveContext("aTestingIntent-listener-triggered");
      const intentResolution = await control.raiseIntent("aTestingIntent", "testContextX");
      control.validateIntentResolution(IntentApp.IntentAppA, intentResolution);
      await result;
    });

    const RaiseIntentTargetedAppResolve = "(2.0-RaiseIntentTargetedAppResolve) Should start app intent-b when raising intent 'sharedTestingIntent1' with context 'testContextX'";
    it(RaiseIntentTargetedAppResolve, async () => {
      await control.listenForError();
      const result = control.receiveContext("sharedTestingIntent1-listener-triggered");
      const intentResolution = await control.raiseIntent("sharedTestingIntent1", "testContextX", {
        appId: IntentApp.IntentAppB,
      });
      control.validateIntentResolution(IntentApp.IntentAppB, intentResolution);
      await result;
    });

    const RaiseIntentTargetedInstanceResolveOpen = "(2.0-RaiseIntentTargetedInstanceResolveOpen) Should target running instance of intent-a app when raising intent 'aTestingIntent1' with context 'testContextX' after opening intent-a app";
    it(RaiseIntentTargetedInstanceResolveOpen, async () => {
      // add app control listeners
      await control.listenForError();
      const confirmAppOpened = control.receiveContext("intent-app-a-opened");
      const result = control.receiveContext("aTestingIntent-listener-triggered");

      const appIdentifier = await control.openIntentApp(IntentApp.IntentAppA);
      await confirmAppOpened;

      const intentResolution = await control.raiseIntent("aTestingIntent", "testContextX", appIdentifier);
      await result;
      control.validateIntentResolution(IntentApp.IntentAppA, intentResolution);
      const instances = await control.findInstances(IntentApp.IntentAppA);
      control.validateInstances(instances, 1, appIdentifier.instanceId, (await result).instanceId);
    });

    const RaiseIntentTargetedInstanceResolveFindInstances = "(2.0-RaiseIntentTargetedInstanceResolveFindInstances) Should start app intent-a when targeted by raising intent 'aTestingIntent1' with context 'testContextX'";
    it(RaiseIntentTargetedInstanceResolveFindInstances, async () => {
      // add app control listeners
      await control.listenForError();
      const confirmAppOpened = control.receiveContext("intent-app-a-opened");
      const result = control.receiveContext("aTestingIntent-listener-triggered");

      const appIdentifier = await control.openIntentApp(IntentApp.IntentAppA);
      const instances = await control.findInstances(IntentApp.IntentAppA);
      control.validateInstances(instances, 1, appIdentifier.instanceId);
      await confirmAppOpened;

      const intentResolution = await control.raiseIntent("aTestingIntent", "testContextX", instances[0]);
      await result;
      control.validateIntentResolution(IntentApp.IntentAppA, intentResolution);

      const instances2 = await control.findInstances(IntentApp.IntentAppA);
      expect(instances2.length).to.be.equal(1); //make sure no other instance is started
    });

    const PrivateChannelsAreNotAppChannels = "(2.0-PrivateChannelsAreNotAppChannels) Cannot create an app channel using a private channel id";
    it(PrivateChannelsAreNotAppChannels, async () => {
      await control.listenForError();
      const privChan = await control.createPrivateChannel();
      control.validatePrivateChannel(privChan);
      const privChan2 = await control.createPrivateChannel();
      control.validatePrivateChannel(privChan2);

      expect(privChan.id).to.not.be.equal(privChan2.id); //check that the ids of both private channels are different
      try {
        await control.createAppChannel(privChan.id);
        assert.fail("No error was not thrown when calling fdc3.getOrCreateChannel(privateChannel.id)");
      } catch (ex) {
        expect(ex).to.have.property("message", ChannelError.AccessDenied, `Incorrect error received when calling fdc3.getOrCreateChannel(privateChannel.id). Expected AccessDenied, got ${ex.message}`);
      }

      const intentResolution = await control.raiseIntent("privateChannelIsPrivate", "privateChannelId", undefined, undefined, { key: privChan2.id });
      control.validateIntentResolution(IntentApp.IntentAppJ, intentResolution);
      let result = await control.getIntentResult(intentResolution);
      control.validateIntentResult(result, IntentResultType.Context, "privateChannelId");
    });

    const PrivateChannelsLifecycleEvents = "(2.0-PrivateChannelsLifecycleEvents) PrivateChannel lifecycle events are triggered when expected";
    it(PrivateChannelsLifecycleEvents, async () => {
      await control.listenForError();
      let onUnsubscribeReceiver = control.receiveContext("onUnsubscribeTriggered");
      const intentResolution = await control.raiseIntent("kTestingIntent", "testContextX", {
        appId: IntentApp.IntentAppK,
      });
      control.validateIntentResolution(IntentApp.IntentAppK, intentResolution);
      let result = await control.getIntentResult(intentResolution);
      control.validateIntentResult(result, IntentResultType.PrivateChannel);
      let listener = await control.receiveContextStreamFromMockApp(<PrivateChannel>result, 1, 5);
      control.unsubscribeListener(listener);
      await onUnsubscribeReceiver; //should receive context from privChannel.onUnsubscribe in mock app
      let textContextXReceiver = control.receiveContext("testContextX");
      control.privateChannelBroadcast(<PrivateChannel>result, "testContextX");
      await textContextXReceiver;
      let onUnsubscribeReceiver2 = control.receiveContext("onUnsubscribeTriggered");
      let onDisconnectReceiver = control.receiveContext("onDisconnectTriggered");
      let listener2 = await control.receiveContextStreamFromMockApp(<PrivateChannel>result, 6, 10);
      control.disconnectPrivateChannel(<PrivateChannel>result);

      //confirm that onUnsubscribe and onDisconnect were triggered in intent-k
      await onUnsubscribeReceiver2;
      await onDisconnectReceiver;
      control.unsubscribeListener(listener2);
    });
  });
