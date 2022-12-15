import { wait } from "../../../utils";
import { RaiseIntentControl2_0, IntentResultType, IntentApp } from "./intent-support-2.0";

const control = new RaiseIntentControl2_0();

export default () =>
  describe("fdc3.raiseIntent (Result)", () => {
    const RaiseIntentVoidResult0secs = "(2.0-RaiseIntentVoidResult0secs) App A receives a void IntentResult";
    it(RaiseIntentVoidResult0secs, async () => {
      await control.listenForError();
      const intentResolution = await control.raiseIntent("aTestingIntent", "testContextX");
      control.validateIntentResolution("IntentAppAId", intentResolution);
      let intentResult = await control.getIntentResult(intentResolution);
      control.validateIntentResult(intentResult, IntentResultType.Void);
    });

    // THIS TEST DOESN'T MAKE SENSE: The returned intentResult is always void/an empty object. therefore its state never changes, either before or after the intent listener returns
    // const RaiseIntentVoidResult5secs = "(2.0-RaiseIntentVoidResult5secs) App A receives a void IntentResult after a 5 second delay";
    // it(RaiseIntentVoidResult5secs, async () => {
    //   await control.listenForError();
    //   let receiver = control.receiveContext("context-received", 8000);
    //   const intentResolution = await control.raiseIntent("aTestingIntent", "testContextX", undefined, 5000);
    //   control.validateIntentResolution("IntentAppAId", intentResolution);
    //   let intentResult = control.getIntentResult(intentResolution);
    //   await receiver;

    //   //give app b time to return
    //   await wait(300);
    //   await intentResult;
    //   control.validateIntentResult(intentResult, IntentResultType.Void);
    // });

    // //TEST DOESN'T MAKE SENSE: see test above
    // const RaiseIntentVoidResult61secs = "(2.0-RaiseIntentVoidResult61secs) App A receives a void IntentResult after a 61 second delay";
    // it(RaiseIntentVoidResult61secs, async () => {
    //   await control.listenForError();
    //   let receiver = control.receiveContext("context-received", 64000);
    //   const intentResolution = await control.raiseIntent("aTestingIntent", "testContextX", undefined, 61000);
    //   control.validateIntentResolution("IntentAppAId", intentResolution);
    //   let intentResult = control.getIntentResult(intentResolution);
    //   await receiver;

    //   //give app b time to return
    //   await wait(300);
    //   await intentResult;
    //   control.validateIntentResult(intentResult, IntentResultType.Void);
    // }).timeout(64000);

    const RaiseIntentContextResult0secs = "(2.0-RaiseIntentContextResult0secs) IntentResult resolves to testContextY";
    it.only(RaiseIntentContextResult0secs, async () => {
      await control.listenForError();
      const intentResolution = await control.raiseIntent("sharedTestingIntent1", "testContextY");
      control.validateIntentResolution(IntentApp.IntentAppB, intentResolution);
      let intentResult = await control.getIntentResult(intentResolution);
      control.validateIntentResult(intentResult, IntentResultType.Context, "testContextY");
    });

    const RaiseIntentContextResult5secs = "(2.0-RaiseIntentContextResult5secs) IntentResult resolves to testContextY instance after a 5 second delay";
    it(RaiseIntentContextResult5secs, async () => {
      await control.listenForError();
      let receiver = control.receiveContext("context-received", 8000);
      const intentResolution = await control.raiseIntent("sharedTestingIntent1", "testContextY", undefined, 5000);
      control.validateIntentResolution(IntentApp.IntentAppB, intentResolution);
      let intentResult = control.getIntentResult(intentResolution);
      await receiver;

      //give app b time to return
      await wait(300);
      await intentResult;
      control.validateIntentResult(intentResult, IntentResultType.Context, "testContextY");
    });

    const RaiseIntentContextResult61secs = "(2.0-RaiseIntentContextResult61secs) IntentResult resolves to testContextY instance after a 61 second delay";
    it(RaiseIntentContextResult61secs, async () => {
      await control.listenForError();
      let receiver = control.receiveContext("context-received", 64000);
      const intentResolution = await control.raiseIntent("sharedTestingIntent1", "testContextY", undefined, 61000);
      control.validateIntentResolution(IntentApp.IntentAppB, intentResolution);
      let intentResult = control.getIntentResult(intentResolution);
      await receiver;

      //give app b time to return
      await wait(300);
      await intentResult;
      control.validateIntentResult(intentResult, IntentResultType.Context, "testContextY");
    }).timeout(64000);

    const RaiseIntentChannelResult = "(2.0-RaiseIntentChannelResult) IntentResult resolves to a Channel object";
    it(RaiseIntentChannelResult, async () => {
      await control.listenForError();
      let receiver = control.receiveContext("testContextZ", 3000, "uniqueId");
      const intentResolution = await control.raiseIntent("sharedTestingIntent2", "testContextY", {
        appId: IntentApp.IntentAppE,
      });
      control.validateIntentResolution(IntentApp.IntentAppE, intentResolution);
      let intentResult = control.getIntentResult(intentResolution);

      //wait for intent-e to return channel
      await wait(300);
      await intentResult;
      control.validateIntentResult(intentResult, IntentResultType.Channel);
      await receiver;
    });

    const RaiseIntentPrivateChannelResult = "(2.0-RaiseIntentPrivateChannelResult) IntentResult resolves to a private Channel object";
    it(RaiseIntentPrivateChannelResult, async () => {
      await control.listenForError();
      let receiver = control.receiveContext("testContextZ", 3000, "uniqueId");
      const intentResolution = await control.raiseIntent("sharedTestingIntent2", "testContextY", {
        appId: IntentApp.IntentAppF,
      });
      control.validateIntentResolution(IntentApp.IntentAppF, intentResolution);
      let intentResult = control.getIntentResult(intentResolution);

      //wait for intent-e to return private channel
      await wait(300);
      await intentResult;
      control.validateIntentResult(intentResult, IntentResultType.PrivateChannel);
      await receiver;
    });
  });
