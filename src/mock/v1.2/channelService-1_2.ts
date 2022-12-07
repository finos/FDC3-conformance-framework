import { Channel, DesktopAgent } from "fdc3_1_2";
import constants from "../../constants";
import { AppControlContext, ChannelsAppConfig } from "../../test/common/channel-control";
import { commands, channelType } from "../constants";
declare let fdc3: DesktopAgent


export class Fdc3CommandExecutor1_2 {
  //execute commands in order
  async executeCommands(orderedCommands: string[], config: ChannelsAppConfig) {
    let channel: Channel;

    //close ChannelsApp when test is complete
    await this.closeWindowOnCompletion(config.testId);
    for (const command of orderedCommands) {
      switch (command) {
        case commands.joinRetrievedUserChannel: {
          channel = await this.joinRetrievedUserChannel(config.channelId);
          break;
        }
        case commands.retrieveTestAppChannel: {
          if (!config.channelId) {
            throw new Error("Provide `channelId` of an app channel in the config");
          }
          channel = await this.retrieveTestAppChannel(config.channelId);
          break;
        }
        case commands.broadcastInstrumentContext: {
          const contextType = config.contextId ? `fdc3.instrument.${config.contextId}` : "fdc3.instrument";
          this.broadcastContextItem(
            contextType,
            channel,
            config.historyItems,
            config.testId
          );
          break;
        }
        case commands.broadcastContactContext: {
          const contextType = config.contextId ? `fdc3.contact.${config.contextId}` : "fdc3.contact";
          this.broadcastContextItem(
            contextType,
            channel,
            config.historyItems,
            config.testId
          );
          break;
        }
      }
    }

    //notify app A that ChannelsApp has finished executing
    if (config.notifyAppAOnCompletion) {
      await this.notifyAppAOnCompletion(config.testId);
    }
  }

  async joinRetrievedUserChannel(channelId) {
    const systemChannels = await fdc3.getSystemChannels();
    const joinedChannel = systemChannels.find((c) => c.id === channelId);
    if(joinedChannel){
      await fdc3.joinChannel(channelId);
      return joinedChannel;
    }
  }

  // retrieve the passed app channel
  async retrieveTestAppChannel(channelId: string): Promise<Channel> {
    return fdc3.getOrCreateChannel(channelId);
  }

  //get broadcast service and broadcast the given context type
  broadcastContextItem(contextType: string, channel: Channel, historyItems: number, testId: string) {
    let broadcastService = this.getBroadcastService(channel.type);
    broadcastService.broadcast(contextType, historyItems, channel, testId);
  }

  //get app/system channel broadcast service
  getBroadcastService(currentChannelType: string) {
    if (currentChannelType === channelType.app) {
      return this.appChannelBroadcastService;
    } else {
      return this.systemChannelBroadcastService;
    }
  }

  //app channel broadcast service
  appChannelBroadcastService = {
    broadcast: (contextType: string, historyItems: number, channel: Channel, testId: string) => {
      if (channel !== undefined) {
        for (let i = 0; i < historyItems; i++) {
          let context : AppControlContext = {
            type: contextType,
            name: `History-item-${i + 1}`,
            testId
          };
          channel.broadcast(context);
        }
      }
    },
  };

  //system channel broadcast service
  systemChannelBroadcastService = {
    broadcast: (contextType: string, historyItems: number, ignored, testId: string) => {
      for (let i = 0; i < historyItems; i++) {
        let context : AppControlContext = {
          type: contextType,
          name: `History-item-${i + 1}`,
          testId
        };
        fdc3.broadcast(context);
      }
    },
  };

  //close ChannelsApp on completion and respond to app A
  async closeWindowOnCompletion(testId: string) {
    console.log(Date.now() + ` Setting up closeWindow listener`);
    const appControlChannel = await fdc3.getOrCreateChannel(
      constants.ControlChannel
    );
    appControlChannel.addContextListener("closeWindow", async () => {
      console.log(Date.now() + ` Received closeWindow message`);
      appControlChannel.broadcast({ type: "windowClosed", testId: testId } as AppControlContext);
      setTimeout(() => {
        //yield to make sure the broadcast gets out before we close
        window.close();
      }, 1);
    });
  }

  async notifyAppAOnCompletion(testId: string) {
    const appControlChannel = await fdc3.getOrCreateChannel(
      constants.ControlChannel
    );
    this.broadcastContextItem(
      "executionComplete",
      appControlChannel,
      1,
      testId
    );
  }
}
