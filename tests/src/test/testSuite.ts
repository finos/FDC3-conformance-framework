import mocha, { Suite } from "mocha";
import constants from "../constants";

import fdc3AddContextListener_1_2 from "./v1.2/basic/fdc3.addContextListener";
import fdc3AddIntentListener_1_2 from "./v1.2/basic/fdc3.addIntentListener";
import fdc3Broadcast_1_2 from "./v1.2/advanced/fdc3.broadcast";
import fdc3FindIntent_1_2 from "./v1.2/advanced/fdc3.findIntent";
import fdc3FindIntentsByContext_1_2 from "./v1.2/advanced/fdc3.findIntentsByContext";
import fdc3GetCurrentChannel_1_2 from "./v1.2/basic/fdc3.getCurrentChannel";
import fdc3GetInfo_1_2 from "./v1.2/basic/fdc3.getInfo";
import fdc3GetOrCreateChannel_1_2 from "./v1.2/basic/fdc3.getOrCreateChannel";
import fdc3GetSystemChannels_1_2 from "./v1.2/basic/fdc3.getSystemChannels";
import fdc3JoinChannel_1_2 from "./v1.2/basic/fdc3.joinChannel";
import fdc3LeaveCurrentChannel_1_2 from "./v1.2/basic/fdc3.leaveCurrentChannel";
import fdc3Open_1_2 from "./v1.2/advanced/fdc3.open";
import fdc3RaiseIntent_1_2 from "./v1.2/advanced/fdc3.raiseIntent";
import fdc3RaiseIntentForContext_1_2 from "./v1.2/basic/fdc3.raiseIntentForContext";
import fdc3AddContextListener_2_0 from "./v2.0/basic/fdc3.addContextListener";
import fdc3AddIntentListener_2_0 from "./v2.0/basic/fdc3.addIntentListener";
import fdc3Broadcast_2_0 from "./v2.0/advanced/fdc3.broadcast";
// import fdc3FindIntent_2_0 from "./v2.0/fdc3.findIntent";
// import fdc3FindIntentsByContext_2_0 from "./v2.0/fdc3.findIntentsByContext";
import fdc3GetCurrentChannel_2_0 from "./v2.0/basic/fdc3.getCurrentChannel";
import fdc3GetInfo_2_0 from "./v2.0/advanced/fdc3.getInfo";
import fdc3GetInstances_2_0 from "./v2.0/advanced/fdc3.findInstances";
import fdc3GetOrCreateChannel_2_0 from "./v2.0/basic/fdc3.getOrCreateChannel";
import fdc3GetUserChannels_2_0 from "./v2.0/basic/fdc3.getUserChannels";
import fdc3getAppMetadata_2_0 from "./v2.0/advanced/fdc3.getAppMetadata";
import fdc3FindInstances_2_0 from "./v2.0/advanced/fdc3.findInstances";
import fdc3JoinUserChannel_2_0 from "./v2.0/basic/fdc3.joinUserChannel";
import fdc3LeaveCurrentChannel_2_0 from "./v2.0/basic/fdc3.leaveCurrentChannel";
// import fdc3Open_2_0 from "./v2.0/fdc3.open";
// import fdc3RaiseIntent_2_0 from "./v2.0/fdc3.raiseIntent";
import fdc3RaiseIntentForContext_2_0 from "./v2.0/basic/fdc3.raiseIntentForContext";

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

const basicSuite_2_0: testSet = {
  fdc3AddContextListener_2_0: [fdc3AddContextListener_2_0],
  fdc3AddIntentListener_2_0: [fdc3AddIntentListener_2_0],
  fdc3GetCurrentChannel_2_0: [fdc3GetCurrentChannel_2_0],
  fdc3GetInfo_2_0: [fdc3GetInfo_2_0],
  fdc3GetOrCreateChannel_2_0: [fdc3GetOrCreateChannel_2_0],
  fdc3GetUserChannels_2_0: [fdc3GetUserChannels_2_0],
  fdc3JoinUserChannel_2_0: [fdc3JoinUserChannel_2_0],
  fdc3LeaveCurrentChannel_2_0: [fdc3LeaveCurrentChannel_2_0],
  fdc3RaiseIntentForContext_2_0: [fdc3RaiseIntentForContext_2_0],
};

const advancedSuite_1_2: testSet = {
  fdc3Open_1_2: [fdc3Open_1_2],
  fdc3Broadcast_1_2: [fdc3Broadcast_1_2],
  fdc3FindIntent_1_2: [fdc3FindIntent_1_2],
  fdc3RaiseIntent_1_2: [fdc3RaiseIntent_1_2],
  fdc3FindIntentsByContext_1_2: [fdc3FindIntentsByContext_1_2],
};

const advancedSuite_2_0: testSet = {
  fdc3Broadcast_2_0: [fdc3Broadcast_2_0],
  fdc3GetInfo_2_0: [fdc3GetInfo_2_0],
  fdc3FindInstances_2_0: [fdc3FindInstances_2_0],
  fdc3getAppMetadata_2_0: [fdc3getAppMetadata_2_0],
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
  "All 2.0": stripSuites([basicSuite_2_0, advancedSuite_2_0]),
  "Basic 1.2": stripSuites([basicSuite_1_2]),
  "Basic 2.0": stripSuites([basicSuite_2_0]),
  "Advanced 1.2": stripSuites([advancedSuite_1_2]),
  "Advanced 2.0": stripSuites([advancedSuite_2_0]),
  ...basicSuite_1_2,
  ...advancedSuite_1_2,
  ...basicSuite_2_0,
  ...advancedSuite_2_0,
};

export const packs: { [index: string]: string[] } = {
  "1.2 (Combined)": ["All 1.2", "Basic 1.2", "Advanced 1.2"],
  "1.2 (Individual Basic)": Object.keys(basicSuite_1_2),
  "1.2 (Individual Advanced)": Object.keys(advancedSuite_1_2),
  "2.0 (Combined)": ["All 2.0", "Basic 2.0", "Advanced 2.0"],
  "2.0 (Individual Basic)": Object.keys(basicSuite_2_0),
  "2.0 (Individual Advanced)": Object.keys(advancedSuite_2_0),
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
