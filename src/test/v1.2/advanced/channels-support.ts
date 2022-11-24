import { assert, expect } from "chai";
import { Channel, Context, Listener } from "fdc3_1_2";
import { DesktopAgent } from "fdc3_1_2/dist/api/DesktopAgent";
import constants from "../../../constants";
import { sleep, wait } from "../../../utils";
import { AppControlContext, ChannelControl, ChannelsAppConfig, ChannelsAppContext } from "../../common/channel-control";


declare let fdc3: DesktopAgent;

let listener1, listener2: Listener

export class ChannelControl1_2 implements ChannelControl<Channel, Context> {


  retrieveAndJoinChannel = async (
    channelNumber: number
  ): Promise<Channel> => {
    const channel = await this.getUserChannel(channelNumber);
    await fdc3.joinChannel(channel.id);
    return channel;
  };

  getSystemChannels = async () => {
    return await fdc3.getSystemChannels();
  }

  leaveChannel = async () => {
    return await fdc3.leaveCurrentChannel();
  }

  getUserChannel = async (channel: number): Promise<Channel> => {
    const channels = await fdc3.getSystemChannels();
    if (channels.length > 0) {
      return channels[channel - 1];
    } else {
      assert.fail("No system channels available for app A");
    }
  };

  joinChannel = async (channel: Channel) => {
    return fdc3.joinChannel(channel.id)
  }


  createTestChannel = async (name: string = "test-channel") => {
    return fdc3.getOrCreateChannel(name);
  }

  unsubscribeListeners = async () => {
    if (listener1 !== undefined) {
      await listener1.unsubscribe();
      listener1 = undefined;
    }

    if (listener2 !== undefined) {
      await listener2.unsubscribe();
      listener2 = undefined;
    }
  }

  channelCleanUp = async () => {
    await this.unsubscribeListeners();
    await fdc3.leaveCurrentChannel();
  }


  closeChannelsAppWindow = async (testId: string) => {
    //Tell ChannelsApp to close window
    const appControlChannel = await broadcastAppChannelCloseWindow(testId);

    //Wait for ChannelsApp to respond
    await waitForContext("windowClosed", testId, appControlChannel);
    await wait(constants.WindowCloseWaitTime);
  }



  initCompleteListener = async (testId: string) => {
    return waitForContext(
      "executionComplete",
      testId,
      await fdc3.getOrCreateChannel("app-control")
    );
  }

  openChannelApp = async (testId: string, channelId: string | undefined, commands: string[], historyItems: number = undefined, notify: boolean = true) => {
    const channelsAppConfig: ChannelsAppConfig = {
      fdc3ApiVersion: "1.2",
      testId: testId,
      userChannelId: channelId,
      notifyAppAOnCompletion: notify,
    };

    if (channelId) {
      channelsAppConfig.userChannelId = channelId;
    }

    if (historyItems) {
      channelsAppConfig.historyItems = historyItems;
    }

    //Open ChannelsApp then execute commands in order
    await fdc3.open(
      "ChannelsApp",
      buildChannelsAppContext(commands, channelsAppConfig)
    );
  }

  setupAndValidateListener1 = (channel: Channel, expectedContextType: string, errorMessage: string, onComplete: (ctx: Context) => void) => {
    if (channel) {
      listener1 = channel.addContextListener(null, async (context) => {
        expect(context.type).to.be.equals(expectedContextType, errorMessage);
        onComplete(context);
      });
    } else {
      listener1 = fdc3.addContextListener(null, async (context) => {
        expect(context.type).to.be.equals(expectedContextType, errorMessage);
        onComplete(context);
      });
    }

    validateListenerObject(listener1);
  }

  setupAndValidateListener2 = (channel: Channel, expectedContextType: string, errorMessage: string, onComplete: (ctx: Context) => void) => {
    if (channel) {
      listener2 = channel.addContextListener(null, async (context) => {
        expect(context.type).to.be.equals(expectedContextType, errorMessage);
        onComplete(context);
      });
    } else {
      listener2 = fdc3.addContextListener(null, async (context) => {
        expect(context.type).to.be.equals(expectedContextType, errorMessage);
        onComplete(context);
      });
    }

    validateListenerObject(listener2);
  }

  setupContextChecker = async (channel: Channel, expectedContextType: string, errorMessage: string, onComplete: (ctx: Context) => void) => {
    //Retrieve current context from channel
    await channel.getCurrentContext().then(async (context) => {
      expect(context.type).to.be.equals(expectedContextType, errorMessage);
      onComplete(context);
    });
  }



}


function validateListenerObject(listenerObject) {
  assert.isTrue(
    typeof listenerObject === "object",
    "No listener object found"
  );
  expect(typeof listenerObject.unsubscribe).to.be.equals(
    "function",
    "Listener does not contain an unsubscribe method"
  );
}

const broadcastAppChannelCloseWindow = async (testId: string) => {
  const appControlChannel = await fdc3.getOrCreateChannel("app-control");
  /* tslint:disable-next-line */
  const closeContext: AppControlContext = {
    type: "closeWindow",
    testId: testId,
  };
  appControlChannel.broadcast(closeContext);
  return appControlChannel;
};


const waitForContext = (
  contextType: string,
  testId: string,
  channel?: Channel
): Promise<Context> => {
  let executionListener: Listener;
  return new Promise<Context>(async (resolve) => {
    console.log(
      Date.now() +
      ` Waiting for type: "${contextType}", on channel: "${channel.id}" in test: "${testId}"`
    );

    const handler = (context: AppControlContext) => {
      if (testId) {
        if (testId == context.testId) {
          console.log(
            Date.now() + ` Received ${contextType} for test: ${testId}`
          );
          resolve(context);
          if (executionListener) executionListener.unsubscribe();
        } else {
          console.warn(
            Date.now() +
            ` Ignoring "${contextType}" context due to mismatched testId (expected: "${testId}", got "${context.testId}")`
          );
        }
      } else {
        console.log(
          Date.now() +
          ` Received (without testId) "${contextType}" for test: "${testId}"`
        );
        resolve(context);
        if (executionListener) executionListener.unsubscribe();
      }
    };

    if (channel === undefined) {
      executionListener = fdc3.addContextListener(contextType, handler);
    } else {
      executionListener = channel.addContextListener(contextType, handler);
      //App channels do not auto-broadcast current context when you start listening, so retrieve current context to avoid races
      const ccHandler = async (context: AppControlContext) => {
        if (context) {
          if (testId) {
            if (testId == context?.testId && context?.type == contextType) {
              console.log(
                Date.now() +
                ` Received "${contextType}" (from current context) for test: "${testId}"`
              );
              if (executionListener) executionListener.unsubscribe();
              resolve(context);
            } //do not warn as it will be ignoring mismatches which will be common
            else {
              console.log(
                Date.now() +
                ` CHecking for current context of type "${contextType}" for test: "${testId}" Current context did ${context ? "" : "NOT "
                } exist, 
  had testId: "${context?.testId}" (${testId == context?.testId
                  ? "did match"
                  : "did NOT match"
                }) 
  and type "${context?.type}" (${context?.type == contextType
                  ? "did match"
                  : "did NOT match"
                })`
              );
            }
          } else {
            console.log(
              Date.now() +
              ` Received "${contextType}" (from current context) for an unspecified test`
            );
            if (executionListener) executionListener.unsubscribe();
            resolve(context);
          }
        }
      };
      channel.getCurrentContext().then(ccHandler);
    }
  });
};


function buildChannelsAppContext(
  mockAppCommands: string[],
  config: ChannelsAppConfig
): ChannelsAppContext {
  return {
    type: "channelsAppContext",
    commands: mockAppCommands,
    config: {
      fdc3ApiVersion: config.fdc3ApiVersion,
      testId: config.testId,
      notifyAppAOnCompletion: config.notifyAppAOnCompletion ?? false,
      historyItems: config.historyItems ?? 1,
      userChannelId: config.userChannelId ?? null,
    },
  };
}

