import { ChannelError, PrivateChannel } from "fdc3_2_0";
import { assert, expect } from "chai";
import { wait } from "../../../utils";
import { RaiseIntentControl2_0, IntentResultType, IntentApp } from "./intent-support-2.0";

const control = new RaiseIntentControl2_0();

/**
 * Details on the mock apps used in these tests can be found in /mock/README.md
 */
export default () =>
  describe("fdc3.raiseIntent", () => {
    afterEach(async function afterEach() {
      await control.closeIntentAppWindow(this.currentTest.title);
    });

    const RaiseIntentSingleResolve =
      "(2.0-RaiseIntentSingleResolve) Should start app intent-a when raising intent 'aTestingIntent' with context 'testContextX'";
    it(RaiseIntentSingleResolve, async () => {
      await control.listenForError();
      const result = control.receiveContext("fdc3-intent-a-opened");
      const intentResolution = await control.raiseIntent("aTestingIntent", "testContextX");
      control.validateIntentResolution(IntentApp.IntentAppA, intentResolution);
      await result;
    });

    const RaiseIntentTargetedAppResolve =
      "(2.0-RaiseIntentTargetedAppResolve) Should start app intent-a when raising intent 'aTestingIntent' with context 'testContextX'";
    it(RaiseIntentTargetedAppResolve, async () => {
      await control.listenForError();
      const result = control.receiveContext("fdc3-intent-a-opened");
      const intentResolution = await control.raiseIntent("sharedTestingIntent1", "testContextX", {
        appId: IntentApp.IntentAppB,
      });
      control.validateIntentResolution(IntentApp.IntentAppB, intentResolution);
      await result;
    });

    const RaiseIntentTargetedInstanceResolveOpen =
      "(2.0-RaiseIntentTargetedInstanceResolveOpen) Should target running instance of intent-a app when raising intent 'aTestingIntent' with context 'testContextX' after opening intent-a app";
    it(RaiseIntentTargetedInstanceResolveOpen, async () => {
      await control.listenForError();
      const appIdentifier = await control.openIntentApp(IntentApp.IntentAppA);
      const result = control.receiveContext("fdc3-intent-a-opened");
      const intentResolution = await control.raiseIntent("aTestingIntent", "testContextX", appIdentifier);
      control.validateIntentResolution(IntentApp.IntentAppA, intentResolution);
      await result;
      const instances = await control.findInstances(IntentApp.IntentAppA);
      control.validateInstances(instances, 1, appIdentifier.instanceId);
    });

    const RaiseIntentTargetedInstanceResolveFindInstances =
      "(2.0-RaiseIntentTargetedInstanceResolveFindInstances) Should start app intent-a when targeted by raising intent 'aTestingIntent' with context 'testContextX'";
    it(RaiseIntentTargetedInstanceResolveFindInstances, async () => {
      await control.listenForError();
      const appIdentifier = await control.openIntentApp(IntentApp.IntentAppA);
      const instances = await control.findInstances(IntentApp.IntentAppA);
      control.validateInstances(instances, 1, appIdentifier.instanceId);
      const result = control.receiveContext("fdc3-intent-a-opened");
      const intentResolution = await control.raiseIntent("aTestingIntent", "testContextX", appIdentifier);
      control.validateIntentResolution(IntentApp.IntentAppA, intentResolution);
      await result;

      //make sure no other instance is started
      const instances2 = await control.findInstances(IntentApp.IntentAppA);
      expect(instances2.length).to.be.equal(1);
    });

    const PrivateChannelsAreNotAppChannels =
      "(2.0-PrivateChannelsAreNotAppChannels) Cannot create an app channel using a private channel id";
    it(PrivateChannelsAreNotAppChannels, async () => {
      await control.listenForError();
      const privChan = await control.createPrivateChannel();
      control.validatePrivateChannel(privChan);
      const privChan2 = await control.createPrivateChannel();
      control.validatePrivateChannel(privChan2);

      //confirm that the ids of both private channels are different
      expect(privChan.id).to.not.be.equal(privChan2.id);

      try {
        await control.createAppChannel(privChan.id);
        assert.fail("No error was not thrown when calling fdc3.getOrCreateChannel(privateChannel.id)");
      } catch (ex) {
        expect(ex).to.have.property(
          "message",
          ChannelError.AccessDenied,
          `Incorrect error received when calling fdc3.getOrCreateChannel(privateChannel.id). Expected AccessDenied, got ${ex.message}`
        );
      }

      const intentResolution = await control.raiseIntent(
        "privateChanneliIsPrivate",
        "privateChannelId",
        undefined,
        undefined,
        { key: privChan2.id }
      );

      control.validateIntentResolution(IntentApp.IntentAppF, intentResolution);
      let result = control.getIntentResult(intentResolution);
      await wait(300);
      await result;
      control.validateIntentResult(result, IntentResultType.PrivateChannel);
    });

    const PrivateChannelsLifecycleEvents =
      "(2.0-PrivateChannelsLifecycleEvents) PrivateChannel lifecycle events are triggered when expected";
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
