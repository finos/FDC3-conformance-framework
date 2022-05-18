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
import mocha from "mocha";
import constants from "../constants";
var nonInteractiveTestSuites = [
    fdc3AddContextListener,
    fdc3AddIntentListener,
    fdc3Broadcast,
    fdc3GetCurrentChannel,
    fdc3GetInfo,
    fdc3GetOrCreateChannel,
    fdc3GetSystemChannels,
    fdc3JoinChannel,
    fdc3LeaveCurrentChannel,
];
var potentiallyInteractiveTestSuites = [
    fdc3FindIntent,
    fdc3Open,
    fdc3RaiseIntent,
    fdc3RaiseIntentForContext,
    fdc3FindIntentsByContext,
];
var commonInitialisation = function () {
    // Mocha setup creates the describe and it functions,
    // so must happens before test definition
    mocha.setup({
        ui: "bdd",
        reporter: "json",
        cleanReferencesAfterRun: false,
    });
    // The Typescript mappings are missing the global timeout function
    mocha.timeout(constants.TestTimeout);
};
var initNonInteractive = function () {
    nonInteractiveTestSuites.forEach(function (suite) { return suite(); });
};
var initPotentiallyInteractive = function () {
    potentiallyInteractiveTestSuites.forEach(function (suite) { return suite(); });
};
export var initAllTests = function () {
    commonInitialisation();
    initNonInteractive();
    initPotentiallyInteractive();
};
export var initNonInteractiveTests = function (fdc3) {
    if (fdc3) {
        if (typeof window === "undefined") {
            global.window = { fdc3: fdc3 };
            if (typeof location === "undefined") {
                global.location = {};
            }
        }
        else {
            window.fdc3 = fdc3;
        }
    }
    commonInitialisation();
    initNonInteractive();
};
export var runTests = function (resultHandlers) {
    var runner = mocha.run();
    var passed = [];
    var failed = [];
    if (resultHandlers) {
        if (resultHandlers.onStart) {
            runner.on("start", function () {
                resultHandlers.onStart(runner);
            });
        }
        if (resultHandlers.onPass) {
            runner.on("pass", function (test) {
                passed.push(test);
                resultHandlers.onPass(test);
            });
        }
        if (resultHandlers.onFail) {
            runner.on("fail", function (test) {
                failed.push(test);
                resultHandlers.onFail(test);
            });
        }
        if (resultHandlers.onComplete) {
            runner.on("end", function () {
                resultHandlers.onComplete({
                    passed: passed,
                    failed: failed,
                    stats: runner.stats,
                });
            });
        }
    }
};
//# sourceMappingURL=testSuite.js.map