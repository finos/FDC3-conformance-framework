import { DesktopAgent } from "fdc3_1_2";
import { AppControlContext } from "../../test/common/channel-control";
import { commands, channelType } from "../constants";
declare let fdc3: DesktopAgent


export class Fdc3CommandExecutor1_2 {
  //execute commands in order
  async executeCommands(orderedCommands, config) {
    let channel;

    //close ChannelsApp when test is complete
    await this.closeWindowOnCompletion(config.testId);
    for (const command of orderedCommands) {
      switch (command) {
        case commands.joinRetrievedUserChannel: {
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

  async joinRetrievedUserChannel(channelId) {
    const systemChannels = await fdc3.getSystemChannels();
    const joinedChannel = systemChannels.find((c) => c.id === channelId);
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
    broadcastService.broadcast(contextType, historyItems, channel, testId);
  }

  //get app/system channel broadcast service
  getBroadcastService(currentChannelType) {
    if (currentChannelType === channelType.app) {
      return this.appChannelBroadcastService;
    } else {
      return this.systemChannelBroadcastService;
    }
  }

  //app channel broadcast service
  appChannelBroadcastService = {
    broadcast: (contextType, historyItems, channel, testId) => {
      if (channel !== undefined) {
        for (let i = 0; i < historyItems; i++) {
          let context : AppControlContext = {
            type: contextType,
            name: `History-item-${i + 1}`,
          };
          if (testId) context.testId = testId;
          channel.broadcast(context);
        }
      }
    },
  };

  //system channel broadcast service
  systemChannelBroadcastService = {
    broadcast: (contextType, historyItems, ignored, testId) => {
      for (let i = 0; i < historyItems; i++) {
        let context : AppControlContext = {
          type: contextType,
          name: `History-item-${i + 1}`,
        };
        if (testId) context.testId = testId;
        fdc3.broadcast(context);
      }
    },
  };

  //close ChannelsApp on completion and respond to app A
  async closeWindowOnCompletion(testId) {
    console.log(Date.now() + ` Setting up closeWindow listener`);
    const appControlChannel = await fdc3.getOrCreateChannel(
      "app-control"
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
