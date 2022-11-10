import mocha, { Suite } from "mocha";
import constants from "../constants";
import fdc3AddContextListener from "./basic/fdc3.addContextListener";
import fdc3AddIntentListener from "./basic/fdc3.addIntentListener";
import fdc3Broadcast from "./advanced/fdc3.broadcast";
import fdc3FindIntent from "./advanced/fdc3.findIntent";
import fdc3FindIntentsByContext from "./advanced/fdc3.findIntentsByContext";
import fdc3GetCurrentChannel from "./basic/fdc3.getCurrentChannel";
import fdc3GetInfo from "./basic/fdc3.getInfo";
import fdc3GetOrCreateChannel from "./basic/fdc3.getOrCreateChannel";
import fdc3GetSystemChannels from "./basic/fdc3.getSystemChannels";
import fdc3JoinChannel from "./basic/fdc3.joinChannel";
import fdc3LeaveCurrentChannel from "./basic/fdc3.leaveCurrentChannel";
import fdc3Open from "./advanced/fdc3.open";
import fdc3RaiseIntent from "./advanced/fdc3.raiseIntent";
import fdc3RaiseIntentForContext from "./basic/fdc3.raiseIntentForContext";

const advancedSuite: (() => Suite)[] = [
  fdc3Broadcast,
  fdc3FindIntent,
  fdc3Open,
  fdc3RaiseIntent,
  fdc3RaiseIntentForContext,
];

const basicSuite = [
  fdc3AddContextListener,
  fdc3AddIntentListener,
  fdc3GetCurrentChannel,
  fdc3GetInfo,
  fdc3GetOrCreateChannel,
  fdc3GetSystemChannels,
  fdc3JoinChannel,
  fdc3LeaveCurrentChannel,
  fdc3FindIntentsByContext,
];

const allSuites = [...basicSuite, ...advancedSuite];

export const packs: { [index: string]: (() => Suite)[] } = {
  All: allSuites,
  Basic: basicSuite,
  Advanced: advancedSuite,
  fdc3AddContextListener: [fdc3AddContextListener],
  fdc3Broadcast: [fdc3Broadcast],
  fdc3FindIntent: [fdc3FindIntent],
  fdc3Open: [fdc3Open],
  fdc3RaiseIntent: [fdc3RaiseIntent],
  fdc3RaiseIntentForContext: [fdc3RaiseIntentForContext],
  fdc3AddIntentListener: [fdc3AddIntentListener],
  fdc3GetCurrentChannel: [fdc3GetCurrentChannel],
  fdc3GetInfo: [fdc3GetInfo],
  fdc3GetOrCreateChannel: [fdc3GetOrCreateChannel],
  fdc3GetSystemChannels: [fdc3GetSystemChannels],
  fdc3JoinChannel: [fdc3JoinChannel],
  fdc3LeaveCurrentChannel: [fdc3LeaveCurrentChannel],
  fdc3FindIntentsByContext: [fdc3FindIntentsByContext],
};

export function getPackNames(): string[] {
  return Object.keys(packs);
}

/**
 * Intended for running tests in container with results shown
 * in HTML page
 */
export const executeTestsInBrowser = (pack: string) => {
  (mocha as any).timeout(constants.TestTimeout);
  packs[pack]
    .sort((s1, s2) => s1.name.localeCompare(s2.name))
    .forEach((suite) => suite());
  mocha.run();
};
