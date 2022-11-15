class Fdc3CommandExecutor1_2 {
  //execute commands in order
  async executeCommands(orderedCommands, config) {
    let channel;
    let stats = document.getElementById("context");
    stats.innerHTML += "executer reached";
    //close ChannelsApp when test is complete
    await this.closeWindowOnCompletion(config.testId);

    for (const command of orderedCommands) {
      switch (command) {
        case "joinSystemChannelOne": {
          channel = await this.joinSystemChannelOne();
          break;
        }
        case "retrieveTestAppChannel": {
          channel = await this.retrieveTestAppChannel();
          break;
        }
        case "broadcastInstrumentContext": {
          await this.broadcastContextItem(
            "fdc3.instrument",
            channel,
            config.historyItems,
            config.testId
          );
          break;
        }
        case "broadcastContactContext": {
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
  async broadcastContextItem(contextType, channel, historyItems, testId) {
    let broadcastService = this.getBroadcastService(channel.type);
    broadcastService.broadcast(contextType, historyItems, channel, testId);
  }

  //get app/system channel broadcast service
  getBroadcastService(currentChannelType) {
    if (currentChannelType === "system") {
      return this.systemChannelBroadcastService;
    } else if (currentChannelType === "app") {
      return this.appChannelBroadcastService;
    }
  }

  //app channel broadcast service
  appChannelBroadcastService = {
    broadcast: (contextType, historyItems, channel, testId) => {
      if (channel !== undefined) {
        for (let i = 0; i < historyItems; i++) {
          let context = {
            type: contextType,
            name: `History-item-${i + 1}`,
          };
          if(testId) context.testId = testId;
          channel.broadcast(context);
        }
      }
    },
  };

  //system channel broadcast service
  systemChannelBroadcastService = {
    broadcast: (contextType, historyItems, ignored, testId) => {
      for (let i = 0; i < historyItems; i++) {
        let context = {
          type: contextType,
          name: `History-item-${i + 1}`,
        };
        if(testId) context.testId = testId;
        window.fdc3.broadcast(context);
      }
    },
  };

  //close ChannelsApp on completion and respond to app A
  async closeWindowOnCompletion(testId) {
    console.log(
      Date.now() + ` Setting up closeWindow listener`
    );
    const appControlChannel = await window.fdc3.getOrCreateChannel(
      "app-control"
    );
    appControlChannel.addContextListener("closeWindow", async () => {
      console.log(
        Date.now() + ` Received closeWindow message`
      );
      appControlChannel.broadcast({ type: "windowClosed", testId: testId });
      setTimeout(()=>{ //yield to make sure the broadcast gets out before we close
        window.close();
      },1);
    });
  }

  async notifyAppAOnCompletion(testId) {
    const appControlChannel = await window.fdc3.getOrCreateChannel(
      "app-control"
    );
    await this.broadcastContextItem("executionComplete", appControlChannel, 1, testId);
  }
}


