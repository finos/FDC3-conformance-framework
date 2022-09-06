import mocha from "mocha";
import constants from "../constants";
import fdc3AddContextListener from "./fdc3.addContextListener";
import fdc3AddIntentListener from "./fdc3.addIntentListener";
import fdc3Broadcast from "./fdc3.broadcast";
import fdc3FindIntent from "./fdc3.findIntent";
import fdc3FindIntentsByContext from "./fdc3.findIntentsByContext";
import fdc3GetCurrentChannel from "./fdc3.getCurrentChannel";
import fdc3GetInfo from "./fdc3.getInfo";
import fdc3GetOrCreateChannel from "./fdc3.getOrCreateChannel";
import fdc3GetSystemChannels from "./fdc3.getSystemChannels";
import fdc3JoinChannel from "./fdc3.joinChannel";
import fdc3LeaveCurrentChannel from "./fdc3.leaveCurrentChannel";
import fdc3Open from "./fdc3.open";
import fdc3RaiseIntent from "./fdc3.raiseIntent";
import fdc3RaiseIntentForContext from "./fdc3.raiseIntentForContext";

const testSuites = [
  fdc3AddContextListener,
  fdc3AddIntentListener,
  fdc3Broadcast,
  fdc3GetCurrentChannel,
  fdc3GetInfo,
  fdc3GetOrCreateChannel,
  fdc3GetSystemChannels,
  fdc3JoinChannel,
  fdc3LeaveCurrentChannel,
  fdc3FindIntent,
  fdc3Open,
  fdc3RaiseIntent,
  fdc3RaiseIntentForContext,
  fdc3FindIntentsByContext,
];

/**
 * Intended for running tests in container with results shown
 * in HTML page
 */
export const executeTestsInBrowser = () => {
  (mocha as any).timeout(constants.TestTimeout);
  testSuites
    .sort((s1, s2) => s1.name.localeCompare(s2.name))
    .forEach((suite) => suite());
  mocha.run();
};
