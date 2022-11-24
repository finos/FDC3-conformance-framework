
/**
 * This interface contains everything you need to do to control channels/context listeners in either 1.2 or 2.0 FDC3
 */
export interface ChannelControl<X, Y> {

    // channels
    retrieveAndJoinChannel(channelNumber: number): Promise<X>
    getSystemChannels(): Promise<X[]>
    leaveChannel(): Promise<void>
    getUserChannel(cn: number): Promise<X>
    joinChannel(channel: X): Promise<void>
    createTestChannel(name?: string): Promise<X>
  
    // test control
    closeChannelsAppWindow(testId: string)
    channelCleanUp()
    unsubscribeListeners()
    openChannelApp(testId: string, channelId: string | undefined, commands: string[], historyItems?: number, notify?: boolean)
  
    // listening
    initCompleteListener(testId: string): Promise<Y>
    setupAndValidateListener1(channel: X, expectedContextType: string, errorMessage: string, onComplete: (ctx: Y) => void)
    setupAndValidateListener2(channel: X, expectedContextType: string, errorMessage: string, onComplete: (ctx: Y) => void)
    setupContextChecker(channel: X, expectedContextType: string, errorMessage: string, onComplete: (ctx: Y) => void)
  
  }
  
/** same in 1.2 and 2.0 */  
export interface CommonContext {
    id?: {
        [key: string]: string;
    };
    name?: string;
    type: string;
}


export interface AppControlContext extends CommonContext {
    testId?: string;
  }
  
  export type ChannelsAppContext = CommonContext & {
    commands: string[];
    config: {
      testId: string;
      notifyAppAOnCompletion: boolean;
      historyItems: number;
      fdc3ApiVersion: string;
      userChannelId: string;
    };
  };
  
  export type ChannelsAppConfig = {
    fdc3ApiVersion: string;
    testId: string;
    userChannelId?: string;
    notifyAppAOnCompletion?: boolean;
    historyItems?: number;
  };
  
  
  export const commands = {
    joinRetrievedUserChannel: "joinRetrievedUserChannel",
    retrieveTestAppChannel: "retrieveTestAppChannel",
    broadcastInstrumentContext: "broadcastInstrumentContext",
    broadcastContactContext: "broadcastContactContext",
  };
  
  export const APP_CHANNEL_AND_BROADCAST = [
    commands.retrieveTestAppChannel,
    commands.broadcastInstrumentContext,
  ]
  
  export const APP_CHANNEL_AND_BROADCAST_TWICE = [
    commands.retrieveTestAppChannel,
    commands.broadcastInstrumentContext,
    commands.broadcastContactContext
  ]
  
  
  export const JOIN_AND_BROADCAST = [
    commands.joinRetrievedUserChannel,
    commands.broadcastInstrumentContext,
  ];
  
  export const JOIN_AND_BROADCAST_TWICE = [
    commands.joinRetrievedUserChannel,
    commands.broadcastInstrumentContext,
    commands.broadcastContactContext
  ];
  