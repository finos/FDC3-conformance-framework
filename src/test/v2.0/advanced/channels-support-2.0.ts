import { assert, expect } from "chai";
import { Channel, Context, Listener, DesktopAgent } from "fdc3_2_0";
import constants from "../../../constants";
import { sleep, wait } from "../../../utils";
import { AppControlContext, ChannelControl, ChannelsAppConfig, ChannelsAppContext } from "../../common/channel-control";


declare let fdc3: DesktopAgent;

let listener1: Listener, listener2: Listener

export class ChannelControl2_0 implements ChannelControl<Channel, Context> {
  private readonly testAppChannelName = "test-channel";

  retrieveAndJoinChannel = async (
    channelNumber: number
  ): Promise<Channel> => {
    const channel = await this.getUserChannel(channelNumber);
    await fdc3.joinUserChannel(channel.id);
    return channel;
  };

  getSystemChannels = async () => {
    return await fdc3.getUserChannels();
  }

  leaveChannel = async () => {
    return await fdc3.leaveCurrentChannel();
  }

  getUserChannel = async (channel: number): Promise<Channel> => {
    const channels = await fdc3.getUserChannels();
    if (channels.length > 0) {
      return channels[channel - 1];
    } else {
      assert.fail("No system channels available for app A");
    }
  };

  joinChannel = async (channel: Channel) => {
    return fdc3.joinUserChannel(channel.id)
  }


  createRandomTestChannel = async (name: string = "test-channel") => {
    const channelName = `${this.testAppChannelName}.${this.getRandomId()}`;
    return fdc3.getOrCreateChannel(channelName);
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
    const receivedContext = await waitForContext(
      "executionComplete",
      testId,
      await fdc3.getOrCreateChannel(constants.ControlChannel)
    );
    
    await wait(constants.ShortWait)

    return receivedContext;
  }

  openChannelApp = async (testId: string, channelId: string | undefined, commands: string[], historyItems: number = undefined, notify: boolean = true) => {
    const channelsAppConfig: ChannelsAppConfig = {
      fdc3ApiVersion: "2.0",
      testId: testId,
      channelId,
      notifyAppAOnCompletion: notify,
    };

    if (historyItems) {
      channelsAppConfig.historyItems = historyItems;
    }

    //Open ChannelsApp then execute commands in order
    await fdc3.open(
      { appId: "ChannelsAppId" },
      buildChannelsAppContext(commands, channelsAppConfig)
    );
  }

  setupAndValidateListener1 = async (channel: Channel,  listenContextType: string | null, expectedContextType: string | null, errorMessage: string, onComplete: (ctx: Context) => void) => {
    if (channel) {
      listener1 = await channel.addContextListener(listenContextType, (context) => {
        if (expectedContextType != null) {
          expect(context.type).to.be.equals(expectedContextType, errorMessage);
        }
        onComplete(context);
      });
    } else {
      listener1 = await fdc3.addContextListener(expectedContextType, (context) => {
        if (expectedContextType != null) {
          expect(context.type).to.be.equals(expectedContextType, errorMessage);
        }
        onComplete(context);
      });
    }

    validateListenerObject(listener1);
  }

  setupAndValidateListener2 = async (channel: Channel, listenContextType: string | null, expectedContextType: string, errorMessage: string, onComplete: (ctx: Context) => void) => {
    if (channel) {
      listener2 = await channel.addContextListener(listenContextType, (context) => {
        if (expectedContextType != null) {
          expect(context.type).to.be.equals(expectedContextType, errorMessage);
        }
        onComplete(context);
      });
    } else {
      listener2 = await fdc3.addContextListener(expectedContextType, (context) => {
        if (expectedContextType != null) {
          expect(context.type).to.be.equals(expectedContextType, errorMessage);
        }
        onComplete(context);
      });
    }

    validateListenerObject(listener2);
  }

  setupContextChecker = async (channel: Channel,  requestedContextType: string | null, expectedContextType: string, errorMessage: string, onComplete: (ctx: Context) => void): Promise<void> => {
    //Retrieve current context from channel
    const context = (requestedContextType == undefined) ? await channel.getCurrentContext() : await channel.getCurrentContext(requestedContextType);

    expect(context.type).to.be.equals(expectedContextType, errorMessage);
    onComplete(context);
  }

  getRandomId(): string {
    const uint32 = window.crypto.getRandomValues(new Uint32Array(1))[0];

    return uint32.toString(16);
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
  const appControlChannel = await fdc3.getOrCreateChannel(constants.ControlChannel);
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
      executionListener = await fdc3.addContextListener(contextType, handler);
    } else {
      executionListener = await channel.addContextListener(contextType, handler);
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
      channelId: config.channelId,
    },
  };
}

