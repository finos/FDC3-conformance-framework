/**
 * Constants used in compliance testing
 */
 const constants = {
  Fdc3Timeout: 500, // The amount of time to wait for the FDC3Ready event during initialisation
  TestTimeout: 9000, // Tests that take longer than this (in milliseconds) will fail
  WaitTime: 3000, // The amount of time to wait for mock apps to finish processing
  WindowCloseWaitTime: 750, // The amount of time to allow for clean-up of closed windows
  NoListenerTimeout: 61000 // the amount of time to allow for a DA to timeout waiting on a context or intent listener
                           // FDC3 does not define this timeout so this should be extended if the DA uses a longer timeout
} as const;

export default constants;