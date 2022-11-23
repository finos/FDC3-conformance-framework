import { Fdc3CommandExecutor2_0 } from './channelService-2_0'
import { onFdc3Ready } from './mock-functions'
import { ChannelsAppContext } from '../../test/v2.0/advanced/fdc3.broadcast';
import { DesktopAgent } from 'fdc3_2_0';
declare let fdc3: DesktopAgent

onFdc3Ready().then(() => {
    let firedOnce = false;
    //await commands from App A, then execute commands
    fdc3.addContextListener(
        "channelsAppContext",
        (context: ChannelsAppContext) => {
            if (firedOnce === false) {
                firedOnce = true;
                const commandExecutor = new Fdc3CommandExecutor2_0();
                commandExecutor.executeCommands(context.commands, context.config);
            }
        });
});
