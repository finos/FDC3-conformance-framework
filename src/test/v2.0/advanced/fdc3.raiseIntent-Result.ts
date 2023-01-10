import { RaiseIntentControl2_0, IntentResultType, IntentApp, ContextType, Intent } from "./intent-support-2.0";

const control = new RaiseIntentControl2_0();

export default () =>
  describe("fdc3.raiseIntent (Result)", () => {
    afterEach(async function afterEach() {
      await control.closeIntentAppWindow(this.currentTest.title);
    });

    const RaiseIntentVoidResult0secs = "(2.0-RaiseIntentVoidResult0secs) App A receives a void IntentResult";
    it(RaiseIntentVoidResult0secs, async () => {
      await control.listenForError();
      const intentResolution = await control.raiseIntent(Intent.aTestingIntent, ContextType.testContextX);
      control.validateIntentResolution(IntentApp.IntentAppA, intentResolution);
      const intentResult = await control.getIntentResult(intentResolution);
      control.validateIntentResult(intentResult, IntentResultType.Void);
    });

    const RaiseIntentVoidResult5secs = "(2.0-RaiseIntentVoidResult5secs) App A receives a void IntentResult after a 5 second delay";
    it(RaiseIntentVoidResult5secs, async () => {
      await control.listenForError();
      let receiver = control.receiveContext("aTestingIntent-listener-triggered", 8000);
      const intentResolution = await control.raiseIntent(Intent.aTestingIntent, ContextType.testContextX, undefined, 5000);
      control.validateIntentResolution(IntentApp.IntentAppA, intentResolution);
      let intentResultPromise = control.getIntentResult(intentResolution);
      await receiver;

      if (intentResultPromise) {
        const intentResult = await intentResultPromise;
        control.validateIntentResult(intentResult, IntentResultType.Void);
      }
    });

    const RaiseIntentContextResult0secs = "(2.0-RaiseIntentContextResult0secs) IntentResult resolves to testContextY";
    it(RaiseIntentContextResult0secs, async () => {
      await control.listenForError();
      const intentResolution = await control.raiseIntent(Intent.sharedTestingIntent1, ContextType.testContextY);
      control.validateIntentResolution(IntentApp.IntentAppB, intentResolution);
      const intentResult = await control.getIntentResult(intentResolution);
      control.validateIntentResult(intentResult, IntentResultType.Context, ContextType.testContextY);
    });

    const RaiseIntentContextResult5secs = "(2.0-RaiseIntentContextResult5secs) IntentResult resolves to testContextY instance after a 5 second delay";
    it(RaiseIntentContextResult5secs, async () => {
      await control.listenForError();
      let receiver = control.receiveContext("sharedTestingIntent1-listener-triggered", 8000);
      const intentResolution = await control.raiseIntent(Intent.sharedTestingIntent1, ContextType.testContextY, undefined, 5000);
      control.validateIntentResolution(IntentApp.IntentAppB, intentResolution);
      const intentResultPromise = control.getIntentResult(intentResolution);
      await receiver;

      if (intentResultPromise) {
        const intentResult = await intentResultPromise;
        control.validateIntentResult(intentResult, IntentResultType.Context, ContextType.testContextY);
      }
    });

    const RaiseIntentChannelResult = "(2.0-RaiseIntentChannelResult) IntentResult resolves to a Channel object";
    it(RaiseIntentChannelResult, async () => {
      await control.listenForError();
      let receiver = control.receiveContext(ContextType.testContextZ, 5000);
      const intentResolution = await control.raiseIntent(Intent.sharedTestingIntent2, ContextType.testContextY, {
        appId: IntentApp.IntentAppE,
      });
      control.validateIntentResolution(IntentApp.IntentAppE, intentResolution);
      let intentResultPromise = control.getIntentResult(intentResolution);
      await receiver;

      if (intentResultPromise) {
        const intentResult = await intentResultPromise;
        control.validateIntentResult(intentResult, IntentResultType.Channel, (await receiver).instanceId);
      }
    });

    const RaiseIntentPrivateChannelResult = "(2.0-RaiseIntentPrivateChannelResult) IntentResult resolves to a private Channel object";
    it(RaiseIntentPrivateChannelResult, async () => {
      await control.listenForError();
      let receiver = control.receiveContext(ContextType.testContextZ, 5000);
      const intentResolution = await control.raiseIntent(Intent.sharedTestingIntent2, ContextType.testContextY, {
        appId: IntentApp.IntentAppF,
      });
      control.validateIntentResolution(IntentApp.IntentAppF, intentResolution);
      let intentResultPromise = control.getIntentResult(intentResolution);
      await receiver;

      if (intentResultPromise) {
        const intentResult = await intentResultPromise;
        control.validateIntentResult(intentResult, IntentResultType.PrivateChannel, (await receiver).instanceId);
      }
    });

    const RaiseIntentVoidResult61secs = "(2.0-RaiseIntentVoidResult61secs) App A receives a void IntentResult after a 61 second delay";
    it(RaiseIntentVoidResult61secs, async () => {
      await control.listenForError();
      let receiver = control.receiveContext("aTestingIntent-listener-triggered", 64000);
      const intentResolution = await control.raiseIntent(Intent.aTestingIntent, ContextType.testContextX, undefined, 61000);
      control.validateIntentResolution(IntentApp.IntentAppA, intentResolution);
      let intentResultPromise = control.getIntentResult(intentResolution);
      await receiver;

      if (intentResultPromise) {
        const intentResult = await intentResultPromise;
        control.validateIntentResult(intentResult, IntentResultType.Void);
      }
    }).timeout(64000);

    const RaiseIntentContextResult61secs = "(2.0-RaiseIntentContextResult61secs) IntentResult resolves to testContextY instance after a 61 second delay";
    it(RaiseIntentContextResult61secs, async () => {
      await control.listenForError();
      let receiver = control.receiveContext("sharedTestingIntent1-listener-triggered", 64000);
      const intentResolution = await control.raiseIntent(Intent.sharedTestingIntent1, ContextType.testContextY, undefined, 61000);
      control.validateIntentResolution(IntentApp.IntentAppB, intentResolution);
      let intentResultPromise = control.getIntentResult(intentResolution);
      await receiver;

      if (intentResultPromise) {
        const intentResult = await intentResultPromise;
        control.validateIntentResult(intentResult, IntentResultType.Context, ContextType.testContextY);
      }
    }).timeout(64000);
  });
