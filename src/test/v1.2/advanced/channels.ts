import { assert, expect } from "chai";
import { Channel, Context, Listener } from "fdc3_1_2";
import { DesktopAgent } from "fdc3_1_2/dist/api/DesktopAgent";
import constants from "../../../constants";
import { sleep, wait } from "../../../utils";


declare let fdc3: DesktopAgent;

export interface AppControlContext extends Context {
  testId?: string;
}

export type ChannelsAppContext = Context & {
  commands: string[];
  config: {
    testId: string;
    notifyAppAOnCompletion: boolean;
    historyItems: number;
    fdc3ApiVersion: string;
    userChannelId: string;
  };
};

export type ChannelsAppConfig = {
  fdc3ApiVersion: string;
  testId: string;
  userChannelId?: string;
  notifyAppAOnCompletion?: boolean;
  historyItems?: number;
};


export const commands = {
  joinRetrievedUserChannel: "joinRetrievedUserChannel",
  retrieveTestAppChannel: "retrieveTestAppChannel",
  broadcastInstrumentContext: "broadcastInstrumentContext",
  broadcastContactContext: "broadcastContactContext",
};

export const JOIN_AND_BROADCAST = [
  commands.joinRetrievedUserChannel,
  commands.broadcastInstrumentContext,
];

export const JOIN_AND_BROADCAST_TWICE = [
  commands.joinRetrievedUserChannel,
  commands.broadcastInstrumentContext,
  commands.broadcastContactContext
];


export const retrieveAndJoinChannel = async (
  channelNumber: number
): Promise<Channel> => {
  const channel = await getUserChannel(channelNumber);
  await fdc3.joinChannel(channel.id);
  return channel;
};

export const getUserChannel = async (channel: number): Promise<Channel> => {
  const channels = await fdc3.getSystemChannels();
  if (channels.length > 0) {
    return channels[channel - 1];
  } else {
    assert.fail("No system channels available for app A");
  }
};

export function validateListenerObject(listenerObject) {
  assert.isTrue(
    typeof listenerObject === "object",
    "No listener object found"
  );
  expect(typeof listenerObject.unsubscribe).to.be.equals(
    "function",
    "Listener does not contain an unsubscribe method"
  );
}

export async function closeChannelsAppWindow(testId: string) {
  //Tell ChannelsApp to close window
  const appControlChannel = await broadcastAppChannelCloseWindow(testId);

  //Wait for ChannelsApp to respond
  await waitForContext("windowClosed", testId, appControlChannel);
  await wait(constants.WindowCloseWaitTime);
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

export async function unsubscribeListeners(listener: Listener, listener2: Listener) {
  if (listener !== undefined) {
    await listener.unsubscribe();
    listener = undefined;
  }

  if (listener2 !== undefined) {
    await listener2.unsubscribe();
    listener2 = undefined;
  }
}

export const waitForContext = (
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


export function buildChannelsAppContext(
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


