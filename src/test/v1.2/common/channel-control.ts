
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
  