import { Channel, DesktopAgent } from "fdc3_2_0";
import { AppControlContext, ChannelsAppConfig } from "../../test/v2.0/advanced/fdc3.broadcast";
import { commands, channelType } from "../constants";

declare let fdc3: DesktopAgent


export class Fdc3CommandExecutor2_0 {
  //execute commands in order
  async executeCommands(orderedCommands: string[], config: ChannelsAppConfig) {
    let channel: Channel;

    //close ChannelsApp when test is complete
    await this.closeWindowOnCompletion(config.testId);
    for (const command of orderedCommands) {
      switch (command) {
        case commands.joinUserChannelOne: {
          channel = await this.joinRetrievedUserChannel(config.userChannelId);
          break;
        }
        case commands.retrieveTestAppChannel: {
          channel = await this.retrieveTestAppChannel();
          break;
        }
        case commands.broadcastInstrumentContext: {
          await this.broadcastContextItem(
            "fdc3.instrument",
            channel,
            config.historyItems,
            config.testId
          );
          break;
        }
        case commands.broadcastContactContext: {
          await this.broadcastContextItem(
            "fdc3.contact",
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

  async joinRetrievedUserChannel(channelId: string) {
    const userChannels = await fdc3.getUserChannels();
    const joinedChannel = userChannels.find((c) => c.id === channelId);
    if(joinedChannel){
      await fdc3.joinChannel(channelId);
      return joinedChannel;
    }
  }

  //retrieve/create "test-channel" app channel
  async retrieveTestAppChannel() {
    return await fdc3.getOrCreateChannel("test-channel");
  }

  //get broadcast service and broadcast the given context type
  async broadcastContextItem(contextType, channel, historyItems, testId) {
    let broadcastService = this.getBroadcastService(channel.type);
    await broadcastService.broadcast(
      contextType,
      historyItems,
      channel,
      testId
    );
  }

  //get app/system channel broadcast service
  getBroadcastService(currentChannelType: string) {
    if (currentChannelType === channelType.system) {
      return this.systemChannelBroadcastService;
    } else if (currentChannelType === channelType.app) {
      return this.appChannelBroadcastService;
    }
  }

  //app channel broadcast service
  appChannelBroadcastService = {
    broadcast: async (contextType, historyItems, channel, testId) => {
      if (channel !== undefined) {
        for (let i = 0; i < historyItems; i++) {
          let context: AppControlContext = {
            type: contextType,
            name: `History-item-${i + 1}`,
          };
          if (testId) context.testId = testId;
          await channel.broadcast(context);
        }
      }
    },
  };

  //system channel broadcast service
  systemChannelBroadcastService = {
    broadcast: async (contextType, historyItems, ignored, testId) => {
      for (let i = 0; i < historyItems; i++) {
        let context: AppControlContext = {
          type: contextType,
          name: `History-item-${i + 1}`,
        };
        if (testId) context.testId = testId;
        await fdc3.broadcast(context);
      }
    },
  };

  //close ChannelsApp on completion and respond to app A
  async closeWindowOnCompletion(testId) {
    console.log(Date.now() + ` Setting up closeWindow listener`);
    const appControlChannel = await fdc3.getOrCreateChannel(
      "app-control"
    );
    await appControlChannel.addContextListener("closeWindow", async () => {
      console.log(Date.now() + ` Received closeWindow message`);
      await appControlChannel.broadcast({
        type: "windowClosed",
        testId: testId,
      } as AppControlContext);
      setTimeout(() => {
        //yield to make sure the broadcast gets out before we close
        window.close();
      }, 1);
    });
  }

  async notifyAppAOnCompletion(testId) {
    const appControlChannel = await fdc3.getOrCreateChannel(
      "app-control"
    );
    await this.broadcastContextItem(
      "executionComplete",
      appControlChannel,
      1,
      testId
    );
  }
}
