import mocha, { Suite } from "mocha";
import constants from "../../constants";

import fdc3AddContextListener_1_2 from "./basic/fdc3.addContextListener";
import fdc3AddIntentListener_1_2 from "./basic/fdc3.addIntentListener";
import fdc3AppChannels_1_2 from "./advanced/fdc3.app-channels";
import fdc3UserChannels_1_2 from "./advanced/fdc3.user-channels";
import fdc3FindIntent_1_2 from "./advanced/fdc3.findIntent";
import fdc3FindIntentsByContext_1_2 from "./advanced/fdc3.findIntentsByContext";
import fdc3GetCurrentChannel_1_2 from "./basic/fdc3.getCurrentChannel";
import fdc3GetInfo_1_2 from "./basic/fdc3.getInfo";
import fdc3GetOrCreateChannel_1_2 from "./basic/fdc3.getOrCreateChannel";
import fdc3GetSystemChannels_1_2 from "./basic/fdc3.getSystemChannels";
import fdc3JoinChannel_1_2 from "./basic/fdc3.joinChannel";
import fdc3LeaveCurrentChannel_1_2 from "./basic/fdc3.leaveCurrentChannel";
import fdc3Open_1_2 from "./advanced/fdc3.open";
import fdc3RaiseIntent_1_2 from "./advanced/fdc3.raiseIntent";
import fdc3RaiseIntentForContext_1_2 from "./basic/fdc3.raiseIntentForContext";

type testSet = { [key: string]: (() => void)[] };

const basicSuite_1_2: testSet = {
  fdc3AddContextListener_1_2: [fdc3AddContextListener_1_2],
  fdc3AddIntentListener_1_2: [fdc3AddIntentListener_1_2],
  fdc3GetCurrentChannel_1_2: [fdc3GetCurrentChannel_1_2],
  fdc3GetInfo_1_2: [fdc3GetInfo_1_2],
  fdc3GetOrCreateChannel_1_2: [fdc3GetOrCreateChannel_1_2],
  fdc3GetSystemChannels_1_2: [fdc3GetSystemChannels_1_2],
  fdc3JoinChannel_1_2: [fdc3JoinChannel_1_2],
  fdc3LeaveCurrentChannel_1_2: [fdc3LeaveCurrentChannel_1_2],
  fdc3RaiseIntentForContext_1_2: [fdc3RaiseIntentForContext_1_2],
};

const advancedSuite_1_2: testSet = {
  fdc3Open_1_2: [fdc3Open_1_2],
  fdc3AppChannels_1_2: [fdc3AppChannels_1_2],
  fdc3UserChannels_1_2: [fdc3UserChannels_1_2],
  fdc3FindIntent_1_2: [fdc3FindIntent_1_2],
  fdc3RaiseIntent_1_2: [fdc3RaiseIntent_1_2],
  fdc3FindIntentsByContext_1_2: [fdc3FindIntentsByContext_1_2],
};

function stripSuites(ts: testSet[]): (() => void)[] {
  const out: (() => void)[] = [];
  ts.map((item) => {
    const sets = Object.values(item);
    sets.forEach((set) => set.forEach((test) => out.push(test)));
  });
  return out;
}

export const allTests: testSet = {
  "All 1.2": stripSuites([basicSuite_1_2, advancedSuite_1_2]),
  "Basic 1.2": stripSuites([basicSuite_1_2]),
  "Advanced 1.2": stripSuites([advancedSuite_1_2]),
  ...basicSuite_1_2,
  ...advancedSuite_1_2,
};

export const packs: { [index: string]: string[] } = {
  "1.2 (Combined)": ["All 1.2", "Basic 1.2", "Advanced 1.2"],
  "1.2 (Individual Basic)": Object.keys(basicSuite_1_2),
  "1.2 (Individual Advanced)": Object.keys(advancedSuite_1_2),
};

export function getPackNames(): string[] {
  return Object.keys(packs);
}

export function getPackMembers(packName: string): string[] {
  return packs[packName];
}

/**
 * Intended for running tests in container with results shown
 * in HTML page
 */
export const executeTestsInBrowser = (pack: string) => {
  (mocha as any).timeout(constants.TestTimeout);
  const suite = allTests[pack];
  suite.forEach((s) => s());
  mocha.run();
};
