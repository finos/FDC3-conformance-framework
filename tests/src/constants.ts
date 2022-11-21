/**
 * Constants used in compliance testing
 */
const constants = {
  Fdc3Timeout: 500, // The amount of time to wait for the FDC3Ready event during initialisation
  TestTimeout: 9000, // Tests that take longer than this (in milliseconds) will fail
  WaitTime: 3000, // The amount of time to wait for mock apps to finish processing
  WindowCloseWaitTime: 100, // The amount of time to allow for clean-up of closed windows
} as const;

export default constants;
