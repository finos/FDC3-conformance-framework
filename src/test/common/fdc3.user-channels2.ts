import { assert } from "chai";
import { wait } from "../../utils";
import {
  JOIN_AND_BROADCAST,
  JOIN_AND_BROADCAST_TWICE,
} from "./channel-control";
import { ChannelControl } from "./channel-control";

export function createUserChannelTests(
  cc: ChannelControl<any, any>,
  documentation: string,
  prefix: string
): Mocha.Suite {
  const channelName = prefix === "" ? "System channels" : "User channels";
  return describe(channelName, () => {
    beforeEach(cc.channelCleanUp);

    afterEach(async function afterEach() {
      await cc.closeChannelsAppWindow(this.currentTest.title);
      await cc.leaveChannel();
    });


    const scTestId5 =
      "(" +
      prefix +
      "UCFilteredContext2) Should receive multiple contexts when app B broadcasts the listened types to the same user channel";
    it(scTestId5, async () => {
      const errorMessage = `\r\nSteps to reproduce:\r\n- App A adds fdc3.instrument and fdc3.contact context listener\r\n- App A joins channel 1\r\n- App B joins channel 1\r\n- App B broadcasts both context types${documentation}`;

      const resolveExecutionCompleteListener =
        cc.initCompleteListener(scTestId5);
      let contextTypes: string[] = [];
      let receivedContext = false;

      const contextId = cc.getRandomId();

      function checkIfBothContextsReceived() {
       // if (contextTypes.length === 2) {
        //  console.warn(JSON.stringify(contextTypes));
          if (
            contextTypes.includes(`fdc3.contact.${contextId}`) &&
            contextTypes.includes(`fdc3.instrument.${contextId}`)
          ) {
           // assert.fail("Incorrect context received", errorMessage);
          //} else {
            receivedContext = true;
          //}
       // }
      }}

      await cc.setupAndValidateListener1(
        null,
        `fdc3.instrument.${contextId}`,
        `fdc3.instrument.${contextId}`,
        errorMessage,
        (context) => {
          contextTypes.push(context.type);
          checkIfBothContextsReceived();
        }
      );

      await cc.setupAndValidateListener2(
        null,
        `fdc3.contact.${contextId}`,
        `fdc3.contact.${contextId}`,
        errorMessage,
        (context) => {
          contextTypes.push(context.type);
          checkIfBothContextsReceived();
        }
      );

      const channel = await cc.retrieveAndJoinChannel(4);
      await cc.openChannelApp(
        scTestId5,
        channel.id,
        JOIN_AND_BROADCAST_TWICE,
        undefined,
        true,
        contextId
      );
      await resolveExecutionCompleteListener;

    //  if (!receivedContext) {
     //   assert.fail(`At least one context was not received!\n${errorMessage}`);
    //  }
    });



  });
};
