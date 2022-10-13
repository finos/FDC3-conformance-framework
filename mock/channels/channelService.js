class Fdc3CommandExecutor {
  stats;

  constructor() {
    this.stats = window.document.getElementById("context");
  }

  //execute commands in order
  async executeCommands(orderedCommands, config) {
    let channel;

    for (let command of orderedCommands) {
      switch (command) {
        case commands.joinSystemChannelOne: {
          channel = await this.JoinSystemChannelOne();
          this.stats.innerHTML += "joined system channel one/ ";
          break;
        }
        case commands.retrieveTestAppChannel: {
          channel = await this.RetrieveTestAppChannel();
          this.stats.innerHTML += `retrieved test app channel/ `;
          break;
        }
        case commands.broadcastInstrumentContext: {
          await this.BroadcastContextItem("fdc3.instrument", channel, config.historyItems);
          this.stats.innerHTML += "fdc3.instrument type broadcast/ ";
          break;
        }
        case commands.broadcastContactContext: {
          await this.BroadcastContextItem("fdc3.contact", channel, config.historyItems);
          this.stats.innerHTML += "fdc3.contact type broadcast/ ";
          break;
        }
        default: {
          this.stats.innerHTML += `Error - unrecognised command: ${command}/ `;
        }
      }
    }

    //close ChannelsApp when test is complete
    await this.CloseWindowOnCompletion(channel);

    //notify app A that ChannelsApp has finished executing
    if(config.notifyAppAOnCompletion){
      this.NotifyAppAOnCompletion(channel, config);
    }
  }

  async JoinSystemChannelOne() {
    const channels = await window.fdc3.getSystemChannels();
    await window.fdc3.joinChannel(channels[0].id);
    return channels[0];
  }

  //retrieve/create "test-channel" app channel
  async RetrieveTestAppChannel() {
    return await window.fdc3.getOrCreateChannel("test-channel");
  }

  //get broadcast service and broadcast the given context type
  async BroadcastContextItem(contextType, channel, historyItems) {
    let broadcastService = this.getBroadcastService(channel.type);
    await broadcastService.broadcast(contextType, historyItems, channel);
  }

  //get app/system channel broadcast service
  getBroadcastService(currentChannelType) {
    if (currentChannelType === channelType.system) {
      return this.systemChannelBroadcastService;
    } else if (currentChannelType === channelType.app) {
      return this.appChannelBroadcastService;
    } else {
      this.stats.innerHTML += `Error - unrecognised channel type: ${currentChannelType}/ `;
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
      } else {
        this.stats.innerHTML += "Error - app channel undefined/ ";
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

  //await instructions from app A to close ChannelsApp on test completion
  async CloseWindowOnCompletion(channel) {
    if (channel.type === channelType.system) {
      await window.fdc3.addContextListener("closeWindow", () =>
        closeFinsembleWindow()
      );
    } else if (channel.type === channelType.app) {
      await channel.addContextListener("closeWindow", () =>
        closeFinsembleWindow()
      );
    } else {
      this.stats.innerHTML += `Error - unrecognised channel type: ${channel.type}/ `;
    }
  }

  NotifyAppAOnCompletion(channel, config) {
    this.BroadcastContextItem("executionComplete", channel, config.historyItems);
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
