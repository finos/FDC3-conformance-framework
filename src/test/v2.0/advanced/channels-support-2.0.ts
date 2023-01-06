import { assert, expect } from "chai";
import { Channel, Context, Listener, DesktopAgent } from "fdc3_2_0";
import constants from "../../../constants";
import { wait } from "../../../utils";
import { ChannelControl, ChannelsAppConfig, ChannelsAppContext } from "../../common/channel-control";
import { AppControlContext } from "../../../common-types";
import { closeMockAppWindow, waitForContext } from "../utils_2_0";

declare let fdc3: DesktopAgent;

export class ChannelControl2_0 implements ChannelControl<Channel, Context, Listener> {
  private readonly testAppChannelName = "test-channel";

  retrieveAndJoinChannel = async (channelNumber: number, channelId?: string): Promise<Channel> => {
    if (channelNumber) {
      const channel = await this.getUserChannel(channelNumber);
      await fdc3.joinUserChannel(channel.id);
      return channel;
    } else if (channelId) {
      const channel = await this.getUserChannel(undefined, channelId);
      await fdc3.joinUserChannel(channelId);
      return channel;
    } else {
      throw new Error("The retrieveAndJoinChannel function requires at least one parameter to be passed to it");
    }
  };

  getSystemChannels = async () => {
    return await fdc3.getUserChannels();
  };

  leaveChannel = async () => {
    return await fdc3.leaveCurrentChannel();
  };

  getUserChannel = async (channelNumber: number, channelId?: string): Promise<Channel> => {
    const channels = await fdc3.getUserChannels();
    if (channels.length > 0) {
      if (channelNumber) {
        return channels[channelNumber - 1];
      } else if (channelId) {
        return channels.find((channel) => channel.id === channelId);
      } else {
        throw new Error("The getUserChannel function requires at least one parameter to be passed to it");
      }
    } else {
      assert.fail("No system channels available for app A");
    }
  };

  joinChannel = async (channel: Channel) => {
    return await fdc3.joinUserChannel(channel.id);
  };

  createRandomTestChannel = async (name: string = "test-channel") => {
    const channelName = `${this.testAppChannelName}.${this.getRandomId()}`;
    return await fdc3.getOrCreateChannel(channelName);
  };

  getCurrentChannel = async (): Promise<Channel> => {
    return await fdc3.getCurrentChannel();
  };

  unsubscribeListeners = async (listeners: Listener[]) => {
    listeners.map((listener) => {
      listener.unsubscribe();
      listener = undefined;
    });
  };

  closeChannelsAppWindow = async (testId: string) => {
    //Tell ChannelsApp to close window
    const appControlChannel = await broadcastAppChannelCloseWindow(testId);

    //Wait for ChannelsApp to respond
    await waitForContext("windowClosed", testId, appControlChannel);
    await wait(constants.WindowCloseWaitTime);
  };

  initCompleteListener = async (testId: string) => {
    return await waitForContext("executionComplete", testId, await fdc3.getOrCreateChannel(constants.ControlChannel));
  };

  openChannelApp = async (testId: string, channelId: string | undefined, commands: string[], historyItems: number = undefined, notify: boolean = true, contextId?: string) => {
    const channelsAppConfig: ChannelsAppConfig = {
      fdc3ApiVersion: "2.0",
      testId: testId,
      channelId: channelId,
      notifyAppAOnCompletion: notify,
      contextId: contextId,
    };

    if (historyItems) {
      channelsAppConfig.historyItems = historyItems;
    }

    //Open ChannelsApp then execute commands in order
    await fdc3.open({ appId: "ChannelsAppId" }, buildChannelsAppContext(commands, channelsAppConfig));
  };

  async closeMockApp(testId: string) {
    await closeMockAppWindow(testId);
  }

  setupAndValidateListener = async (channel: Channel, listenContextType: string | null, expectedContextType: string | null, errorMessage: string, onComplete: (ctx: Context) => void): Promise<Listener> => {
    let listener;
    if (channel) {
      listener = await channel.addContextListener(listenContextType, (context) => {
        if (expectedContextType != null) {
          expect(context.type).to.be.equals(expectedContextType, errorMessage);
        }
        onComplete(context);
      });
    } else {
      listener = await fdc3.addContextListener(expectedContextType, (context) => {
        if (expectedContextType != null) {
          expect(context.type).to.be.equals(expectedContextType, errorMessage);
        }
        onComplete(context);
      });
    }

    validateListenerObject(listener);
    return listener;
  };

  setupContextChecker = async (channel: Channel, requestedContextType: string | null, expectedContextType: string, errorMessage: string, onComplete: (ctx: Context) => void): Promise<void> => {
    //Retrieve current context from channel
    const context = requestedContextType === undefined ? await channel.getCurrentContext() : await channel.getCurrentContext(requestedContextType);
    expect(context, "await channel.getCurrentContext() returned null").to.not.be.null;
    expect(context.type, "retrieved context was not of the expected type").to.be.equals(expectedContextType, errorMessage);
    onComplete(context);
  };

  getRandomId(): string {
    const uint32 = window.crypto.getRandomValues(new Uint32Array(1))[0];

    return uint32.toString(16);
  }
}

function validateListenerObject(listenerObject) {
  assert.isTrue(typeof listenerObject === "object", "No listener object found");
  expect(typeof listenerObject.unsubscribe).to.be.equals("function", "Listener does not contain an unsubscribe method");
}

const broadcastAppChannelCloseWindow = async (testId: string) => {
  const appControlChannel = await fdc3.getOrCreateChannel(constants.ControlChannel);
  /* tslint:disable-next-line */
  const closeContext: AppControlContext = {
    type: "closeWindow",
    testId: testId,
  };
  await appControlChannel.broadcast(closeContext);
  return appControlChannel;
};

function buildChannelsAppContext(mockAppCommands: string[], config: ChannelsAppConfig): ChannelsAppContext {
  return {
    type: "channelsAppContext",
    commands: mockAppCommands,
    config: {
      fdc3ApiVersion: config.fdc3ApiVersion,
      testId: config.testId,
      notifyAppAOnCompletion: config.notifyAppAOnCompletion ?? false,
      historyItems: config.historyItems ?? 1,
      channelId: config.channelId,
      contextId: config.contextId,
    },
  };
}
