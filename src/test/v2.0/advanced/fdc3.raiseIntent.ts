import { ChannelError, PrivateChannel } from "fdc3_2_0";
import { assert, expect } from "chai";
import { wait } from "../../../utils";
import { IntentControl2_0, IntentResultType } from "./intent-support-2.0";

const control = new IntentControl2_0();

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
      const intentResolution = await control.raiseIntent(
        "aTestingIntent",
        "testContextX"
      );
      control.validateIntentResolution("IntentAppAId", intentResolution);
      await result;
    });

    const RaiseIntentTargetedAppResolve =
      "(2.0-RaiseIntentTargetedAppResolve) Should start app intent-a when raising intent 'aTestingIntent' with context 'testContextX'";
    it(RaiseIntentTargetedAppResolve, async () => {
      await control.listenForError();
      const result = control.receiveContext("fdc3-intent-a-opened");
      const intentResolution = await control.raiseIntent(
        "sharedTestingIntent1",
        "testContextX",
        { appId: "IntentAppBId" }
      );
      control.validateIntentResolution("IntentAppBId", intentResolution);
      await result;
    });

    const RaiseIntentTargetedInstanceResolveOpen =
      "(2.0-RaiseIntentTargetedInstanceResolveOpen) Should target running instance of intent-a app when raising intent 'aTestingIntent' with context 'testContextX' after opening intent-a app";
    it(RaiseIntentTargetedInstanceResolveOpen, async () => {
      await control.listenForError();
      const appIdentifier = await control.openIntentApp("IntentAppAId");
      const result = control.receiveContext("fdc3-intent-a-opened");
      const intentResolution = await control.raiseIntent(
        "aTestingIntent",
        "testContextX",
        appIdentifier
      );
      control.validateIntentResolution("IntentAppAId", intentResolution);
      await result;
      const instances = await control.findInstances("IntentAppAId");
      control.validateInstances(instances, 1, appIdentifier.instanceId);
    });

    const RaiseIntentTargetedInstanceResolveFindInstances =
      "(2.0-RaiseIntentTargetedInstanceResolveFindInstances) Should start app intent-a when targeted by raising intent 'aTestingIntent' with context 'testContextX'";
    it(RaiseIntentTargetedInstanceResolveFindInstances, async () => {
      await control.listenForError();
      const appIdentifier = await control.openIntentApp("IntentAppAId");
      const instances = await control.findInstances("IntentAppAId");
      control.validateInstances(instances, 1, appIdentifier.instanceId);
      const result = control.receiveContext("fdc3-intent-a-opened");
      const intentResolution = await control.raiseIntent(
        "aTestingIntent",
        "testContextX",
        appIdentifier
      );
      control.validateIntentResolution("IntentAppAId", intentResolution);
      await result;

      //make sure no other instance is started
      const instances2 = await control.findInstances("IntentAppAId");
      expect(instances2.length).to.be.equal(1);
    });

    const RaiseIntentVoidResult0secs =
      "(2.0-RaiseIntentVoidResult0secs) App A receives a void IntentResult";
    it(RaiseIntentVoidResult0secs, async () => {
      await control.listenForError();
      const intentResolution = await control.raiseIntent(
        "aTestingIntent",
        "testContextX"
      );
      control.validateIntentResolution("IntentAppAId", intentResolution);
      let intentResult = await control.getIntentResult(intentResolution);
      control.validateIntentResult(intentResult, IntentResultType.Void);
    });

    // THIS TEST DOESN'T MAKE SENSE: The returned intentResult is always void/an empty object. therefore its state never changes, either before or after the intent listener returns
    const RaiseIntentVoidResult5secs =
      "(2.0-RaiseIntentVoidResult5secs) App A receives a void IntentResult after a 5 second delay";
    it(RaiseIntentVoidResult5secs, async () => {
      await control.listenForError();
      let receiver = control.receiveContext("context-received", 8000);
      const intentResolution = await control.raiseIntent(
        "aTestingIntent",
        "testContextX",
        undefined,
        5000
      );
      control.validateIntentResolution("IntentAppAId", intentResolution);
      let intentResult = control.getIntentResult(intentResolution);
      await receiver;

      //give app b time to return
      await wait(300);
      await intentResult;
      control.validateIntentResult(intentResult, IntentResultType.Void);
    });

    //TEST DOESN'T MAKE SENSE: see test above
    const RaiseIntentVoidResult61secs =
      "(2.0-RaiseIntentVoidResult61secs) App A receives a void IntentResult after a 61 second delay";
    it(RaiseIntentVoidResult61secs, async () => {
      await control.listenForError();
      let receiver = control.receiveContext("context-received", 64000);
      const intentResolution = await control.raiseIntent(
        "aTestingIntent",
        "testContextX",
        undefined,
        61000
      );
      control.validateIntentResolution("IntentAppAId", intentResolution);
      let intentResult = control.getIntentResult(intentResolution);
      await receiver;

      //give app b time to return
      await wait(300);
      await intentResult;
      control.validateIntentResult(intentResult, IntentResultType.Void);
    }).timeout(64000);

    const RaiseIntentContextResult0secs =
      "(2.0-RaiseIntentContextResult0secs) IntentResult resolves to testContextY";
    it.only(RaiseIntentContextResult0secs, async () => {
      await control.listenForError();
      const intentResolution = await control.raiseIntent(
        "sharedTestingIntent1",
        "testContextY"
      );
      control.validateIntentResolution("IntentAppAId", intentResolution);
      let intentResult = await control.getIntentResult(intentResolution);
      control.validateIntentResult(
        intentResult,
        IntentResultType.Context,
        "testcontextY"
      );
    });

    const RaiseIntentContextResult5secs =
      "(2.0-RaiseIntentContextResult5secs) IntentResult resolves to testContextY instance after a 5 second delay";
    it.only(RaiseIntentContextResult5secs, async () => {
      await control.listenForError();
      let receiver = control.receiveContext("context-received", 8000);
      const intentResolution = await control.raiseIntent(
        "sharedTestingIntent1",
        "testContextY",
        undefined,
        5000
      );
      control.validateIntentResolution("IntentAppAId", intentResolution);
      let intentResult = control.getIntentResult(intentResolution);
      await receiver;

      //give app b time to return
      await wait(300);
      await intentResult;
      control.validateIntentResult(
        intentResult,
        IntentResultType.Context,
        "testcontextY"
      );
    });

    const RaiseIntentContextResult61secs =
      "(2.0-RaiseIntentContextResult61secs) IntentResult resolves to testContextY instance after a 61 second delay";
    it(RaiseIntentContextResult61secs, async () => {
      await control.listenForError();
      let receiver = control.receiveContext("context-received", 64000);
      const intentResolution = await control.raiseIntent(
        "sharedTestingIntent1",
        "testContextY",
        undefined,
        61000
      );
      control.validateIntentResolution("IntentAppAId", intentResolution);
      let intentResult = control.getIntentResult(intentResolution);
      await receiver;

      //give app b time to return
      await wait(300);
      await intentResult;
      control.validateIntentResult(
        intentResult,
        IntentResultType.Context,
        "testcontextY"
      );
    }).timeout(64000);

    const RaiseIntentChannelResult =
      "(2.0-RaiseIntentChannelResult) IntentResult resolves to a Channel object";
    it(RaiseIntentChannelResult, async () => {
      await control.listenForError();
      let receiver = control.receiveContext("testContextZ", 3000, "uniqueId");
      const intentResolution = await control.raiseIntent(
        "sharedTestingIntent2",
        "testContextY",
        { appId: "IntentAppEId" }
      );
      control.validateIntentResolution("IntentAppEId", intentResolution);
      let intentResult = control.getIntentResult(intentResolution);

      //wait for intent-e to return channel
      await wait(300);
      await intentResult;
      control.validateIntentResult(intentResult, IntentResultType.Channel);
      await receiver;
    });

    const RaiseIntentPrivateChannelResult =
      "(2.0-RaiseIntentPrivateChannelResult) IntentResult resolves to a private Channel object";
    it(RaiseIntentPrivateChannelResult, async () => {
      await control.listenForError();
      let receiver = control.receiveContext("testContextZ", 3000, "uniqueId");
      const intentResolution = await control.raiseIntent(
        "sharedTestingIntent2",
        "testContextY",
        { appId: "IntentAppFId" }
      );
      control.validateIntentResolution("IntentAppFId", intentResolution);
      let intentResult = control.getIntentResult(intentResolution);

      //wait for intent-e to return private channel
      await wait(300);
      await intentResult;
      control.validateIntentResult(
        intentResult,
        IntentResultType.PrivateChannel
      );
      await receiver;
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
        assert.fail(
          "No error was not thrown when calling fdc3.getOrCreateChannel(privateChannel.id)"
        );
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
      control.validateIntentResolution("IntentAppFId", intentResolution);
      let result = control.getIntentResult(intentResolution);
      await wait(300);
      await result;
      control.validateIntentResult(result, IntentResultType.PrivateChannel);
    });

    const PrivateChannelsLifecycleEvents =
      "(2.0-PrivateChannelsLifecycleEvents) ";
    it(PrivateChannelsLifecycleEvents, async () => {
      await control.listenForError();
      let onUnsubscribeReceiver = control.receiveContext(
        "onUnsubscribeTriggered"
      );
      const intentResolution = await control.raiseIntent(
        "kTestingIntent",
        "testContextX",
        { appId: "IntentAppKId" }
      );
      control.validateIntentResolution("IntentAppFId", intentResolution);
      let result = await control.getIntentResult(intentResolution);
      control.validateIntentResult(result, IntentResultType.PrivateChannel);
      let listener = control.receiveContextStreamFromMockApp(
        <PrivateChannel>result,
        1,
        5
      );
      control.unsubscribeListener(listener);
      await onUnsubscribeReceiver; //should receive context from privChannel.onUnsubscribe in mock app
      let textContextXReceiver = control.receiveContext("testContextX");
      control.privateChannelBroadcast(<PrivateChannel>result, "testContextX");
      await textContextXReceiver;
      let onUnsubscribeReceiver2 = control.receiveContext(
        "onUnsubscribeTriggered"
      );
      let onDisconnectReceiver = control.receiveContext(
        "onDisconnectTriggered"
      );
      control.receiveContextStreamFromMockApp(<PrivateChannel>result, 6, 10);
      control.disconnectPrivateChannel(<PrivateChannel>result);

      //confirm that onUnsubscribe and onDisconnect were triggered in intent-k
      await onUnsubscribeReceiver2;
      await onDisconnectReceiver;
    });
  });
