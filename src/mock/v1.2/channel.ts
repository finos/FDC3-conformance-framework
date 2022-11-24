import { Fdc3CommandExecutor1_2 } from './channelService-1_2'
import { onFdc3Ready } from './mock-functions'
import { DesktopAgent } from 'fdc3_1_2';
import { ChannelsAppContext } from '../../test/common/channel-control';
declare let fdc3 : DesktopAgent

onFdc3Ready().then(() => {
    let firedOnce = false;
    //await commands from App A, then execute commands
    fdc3.addContextListener(
        "channelsAppContext",
        (context: ChannelsAppContext) => {
            if (firedOnce === false) {
                firedOnce = true;
                const commandExecutor = new Fdc3CommandExecutor1_2();
                commandExecutor.executeCommands(context.commands, context.config);
            }
        });
});
