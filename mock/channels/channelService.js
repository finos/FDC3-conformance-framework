class AppChannelService {
    async joinChannel() {
        return await window.fdc3.getOrCreateChannel("test-channel");
    }

    async broadcast(contextType, historyItem, channel) {
        await channel.broadcast({
            "type": contextType,
            "name": `History-item-${historyItem}`
        });
    }

    async closeAppOnCompletion(contextType, channel) {
        await channel.addContextListener(
            contextType,
            () => closeFinsembleWindow());
    }
}

class UserChannelService {
    async joinChannel() {
        const channels = await window.fdc3.getSystemChannels();
        await window.fdc3.joinChannel(channels[0].id);
        return channels[0];
    }

    async broadcast(contextType, historyItem) {
        await window.fdc3.broadcast({
            "type": contextType,
            "name": `History-item-${historyItem}`
        });
    }

    async closeAppOnCompletion(contextType) {
        await window.fdc3.addContextListener(
            contextType,
            () => closeFinsembleWindow());
    }
}

