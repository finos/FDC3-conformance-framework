class Fdc3CommandExecutor {
  stats;

  constructor() {
    this.stats = window.document.getElementById("context");
  }

  //execute commands received from app A in order
  async executeCommands(orderedCommands, config) {
    let channel;
    let broadcastService;

    for (let command of orderedCommands) {
      this.stats.innerHTML += `fdc3.command = ${command}/ `;
      switch (command) {
        case commands.joinUserChannelOne: {
          channel = await this.JoinUserChannelOne();
          this.stats.innerHTML += `joinUserChannelOne done/ `;
          break;
        }
        case commands.retrieveTestChannel: {
          channel = await this.RetrieveTestChannel();
          this.stats.innerHTML += `retrieve test channel done/ `;
          break;
        }
        case commands.broadcastInstrumentContext: {
          await this.BroadcastContextItem("fdc3.instrument", channel, config);
          this.stats.innerHTML += `broadcast instrument done/ `;
          break;
        }
        case commands.broadcastContactContext: {
          await this.BroadcastContextItem("fdc3.contact", channel, config);
          this.stats.innerHTML += `broadcast contact done/ `;
          break;
        }
        default: {
          this.stats.innerHTML += `Error - unrecognised command: ${command}/ `;
        }
      }
    }

    //close AppChannel when test is complete
    await this.CloseWindowOnCompletion(channel, config.channelType);
    this.stats.innerHTML += `close app on Completion done/ `;

    //notify app A that ChannelsApp has finished executing
    this.NotifyAppAOnCompletion(config.notifyAppAOnCompletion);
  }

  async JoinUserChannelOne() {
    const channels = await window.fdc3.getSystemChannels();
    await window.fdc3.joinChannel(channels[0].id);
    return channels[0];
  }

  //retrieve/create app channel
  async RetrieveTestChannel() {
    return await window.fdc3.getOrCreateChannel("test-channel");
  }

  //get broadcast service and broadcast the given context item
  async BroadcastContextItem(contextType, channel, config) {
    this.stats.innerHTML += `${config.channelType}/ `;
    let broadcastService = this.getBroadcastService(config.channelType);
    this.stats.innerHTML += `broadcast service retrieved/ `;
    await broadcastService.broadcast(contextType, config.historyItems, channel);
  }

  //get app channel or user channel broadcast service
  getBroadcastService(currentChannelType) {
    if (currentChannelType === channelType.user) {
      this.stats.innerHTML += `returning user channel service/ `;
      return this.userChannelBroadcastService;
    } else if (currentChannelType === channelType.app) {
      this.stats.innerHTML += `returning app channel service/ `;
      return this.appChannelBroadcastService;
    } else {
      this.stats.innerHTML += `Error - unrecognised channel type: ${currentChannelType}/ `;
    }
  }

  //app channel broadcast service
  appChannelBroadcastService = {
    broadcast: async (contextType, historyItems, channel) => {
      this.stats.innerHTML += `app channel broadcast func reached/ `;
      if (channel !== undefined) {
        for (let i = 0; i < historyItems; i++) {
          await channel.broadcast({
            type: contextType,
            name: `History-item-${i + 1}`,
          });
          this.stats.innerHTML += `type: ${contextType}/ name: History-item-${
            i + 1
          } broadcast`;
        }
      } else {
        this.stats.innerHTML += "Error - app channel undefined/ ";
      }
    },
  };

  //user channel broadcast service
  userChannelBroadcastService = {
    broadcast: async (contextType, historyItems) => {
      this.stats.innerHTML += `user channel broadcast reached/ `;
      for (let i = 0; i < historyItems; i++) {
        await window.fdc3.broadcast({
          type: contextType,
          name: `History-item-${i + 1}`,
        });
        this.stats.innerHTML += `type: ${contextType}/ name: History-item-${
          i + 1
        } broadcast/ `;
      }
    },
  };

  //await instructions from app A to close ChannelsApp on test completion
  async CloseWindowOnCompletion(channel, channelType) {
    if (channelType === "user"){
        await window.fdc3.addContextListener("closeWindow", () =>
        closeFinsembleWindow()
      );
    }else if (channelType === "app"){
        await channel.addContextListener("closeWindow", () =>
        closeFinsembleWindow()
      );
    }else{
        this.stats.innerHTML += `Error - unrecognised channel type: ${channelType}/ `;
    }
  }

  NotifyAppAOnCompletion(notifyAppAOnCompletion) {
    this.stats.innerHTML += `Notify app on completion = ${notifyAppAOnCompletion}/ `;
    if (notifyAppAOnCompletion) {
        this.stats.innerHTML += `Notify app on completion entered/ `;
      this.BroadcastContextItem("executionComplete", channel, config);
    }
  }
}

const channelType = {
  user: "user",
  app: "app",
};

const commands = {
  joinUserChannelOne: "joinUserChannelOne",
  retrieveTestChannel: "retrieveTestChannel",
  broadcastInstrumentContext: "broadcastInstrumentContext",
  broadcastContactContext: "broadcastContactContext",
};
