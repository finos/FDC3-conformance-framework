class Fdc3CommandExecutor {
  //execute commands in order
  async executeCommands(orderedCommands, config) {
    let channel;

    for (const command of orderedCommands) {
      switch (command) {
        case commands.joinSystemChannelOne: {
          channel = await this.joinSystemChannelOne();
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
            config.historyItems
          );
          break;
        }
        case commands.broadcastContactContext: {
          await this.broadcastContextItem(
            "fdc3.contact",
            channel,
            config.historyItems
          );
          break;
        }
      }
    }

    //close ChannelsApp when test is complete
    await this.closeWindowOnCompletion();

    //notify app A that ChannelsApp has finished executing
    if (config.notifyAppAOnCompletion) {
      await this.notifyAppAOnCompletion();
    }
  }

  async joinSystemChannelOne() {
    const channels = await window.fdc3.getSystemChannels();
    await window.fdc3.joinChannel(channels[0].id);
    return channels[0];
  }

  //retrieve/create "test-channel" app channel
  async retrieveTestAppChannel() {
    return await window.fdc3.getOrCreateChannel("test-channel");
  }

  //get broadcast service and broadcast the given context type
  async broadcastContextItem(contextType, channel, historyItems) {
    let broadcastService = this.getBroadcastService(channel.type);
    await broadcastService.broadcast(contextType, historyItems, channel);
  }

  //get app/system channel broadcast service
  getBroadcastService(currentChannelType) {
    if (currentChannelType === channelType.system) {
      return this.systemChannelBroadcastService;
    } else if (currentChannelType === channelType.app) {
      return this.appChannelBroadcastService;
    }
  }

  //app channel broadcast service
  appChannelBroadcastService = {
    broadcast: async (contextType, historyItems, channel) => {
      if (channel !== undefined) {
        for (let i = 0; i < historyItems; i++) {
          await channel.broadcast({
            type: contextType,
            name: `History-item-${i + 1}`,
          });
        }
      }
    },
  };

  //system channel broadcast service
  systemChannelBroadcastService = {
    broadcast: async (contextType, historyItems) => {
      for (let i = 0; i < historyItems; i++) {
        await window.fdc3.broadcast({
          type: contextType,
          name: `History-item-${i + 1}`,
        });
      }
    },
  };

  //close ChannelsApp on completion and respond to app A
  async closeWindowOnCompletion() {
    const appControlChannel = await window.fdc3.getOrCreateChannel(
      "app-control"
    );
    await appControlChannel.addContextListener("closeWindow", async () => {
      window.close();
      appControlChannel.broadcast({ type: "windowClosed" });
    });
  }

  async notifyAppAOnCompletion() {
    const appControlChannel = await window.fdc3.getOrCreateChannel(
      "app-control"
    );
    await this.broadcastContextItem("executionComplete", appControlChannel, 1);
  }

  async NotifyAppAOnWindowClose() {
    const appControlChannel = await window.fdc3.getOrCreateChannel(
      "app-control"
    );
    await this.broadcastContextItem("windowClosed", appControlChannel, 1);
  }
}

const channelType = {
  system: "system",
  app: "app",
};

const commands = {
  joinSystemChannelOne: "joinSystemChannelOne",
  retrieveTestAppChannel: "retrieveTestAppChannel",
  broadcastInstrumentContext: "broadcastInstrumentContext",
  broadcastContactContext: "broadcastContactContext",
};
