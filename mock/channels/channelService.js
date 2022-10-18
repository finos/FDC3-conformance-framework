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
    await this.closeWindowOnCompletion(channel, config);

    //notify app A that ChannelsApp has finished executing
    if (config.notifyAppAOnCompletion) {
      await this.notifyAppAOnCompletion(channel, config);
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
  async closeWindowOnCompletion(channel, config) {
    if (channel.type === channelType.system) {
      await window.fdc3.addContextListener("closeWindow", async () => {
        window.close();
        await window.fdc3.broadcast({type: "windowClosed"});
      });
    } else if (channel.type === channelType.app) {
      await channel.addContextListener("closeWindow", async () => {
        window.close();
        channel.broadcast({type: "windowClosed"});
      });
    }
  }

  async notifyAppAOnCompletion(channel, config) {
    await this.broadcastContextItem(
      "executionComplete",
      channel,
      config.historyItems
    );
  }

  async NotifyAppAOnWindowClose(channel, config) {
    await this.broadcastContextItem(
      "windowClosed",
      channel,
      config.historyItems
    );
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
