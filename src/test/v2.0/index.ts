export * from "./testSuite";
import { getPackMembers, getPackNames, executeTestsInBrowser, executeManualTestsInBrowser } from "./testSuite";

require("mocha/mocha.css");
require("source-map-support/browser-source-map-support.js");

mocha.setup("bdd");
const version = document.getElementById("version");

// populate drop-down
getPackNames().forEach((pn) => {
  const optGroup = document.createElement("optgroup");
  optGroup.setAttribute("label", pn);
  getPackMembers(pn).forEach((pm) => {
    const opt = document.createElement("option");
    const text = document.createTextNode(pm);
    opt.setAttribute("value", pm);
    opt.appendChild(text);
    optGroup.appendChild(opt);
  });
  version.appendChild(optGroup);
});

function executeTests() {
  toggleVersionSelector();
  toggleBackButton();
  const fdc3Versions = document.getElementById("version") as HTMLSelectElement;
  var selectedVersion = fdc3Versions.options[fdc3Versions.selectedIndex].innerHTML;
  const action = () => executeTestsInBrowser(selectedVersion);
  if (window.fdc3) {
    action();
  } else {
    window.addEventListener("fdc3Ready", action);
  }
}

function executeManualTests() {
  toggleVersionSelector();
  toggleBackButton();
  const manualTests = document.getElementById("manualTests") as HTMLSelectElement;
  var selectedManualTest = manualTests.options[manualTests.selectedIndex].innerHTML;
  const action = () => executeManualTestsInBrowser(selectedManualTest);
  if (window.fdc3) {
    action();
  } else {
    window.addEventListener("fdc3Ready", action);
  }
}

function returnToTestSelection() {
  location.href = '/v2.0/app/index.html';
}

function toggleVersionSelector() {
  const versionSelector = document.getElementById("version-selector");
  const manualSelector = document.getElementById("manualTests-selector");  
  if (versionSelector.style.display === "none") {
    versionSelector.style.display = "block";
    manualSelector.style.display = "block";
  } else {
    versionSelector.style.display = "none";
    manualSelector.style.display = "none";
  }
}

function toggleBackButton() {
  const backButton = document.getElementById("back-button");
  if (window.getComputedStyle(backButton).display === "none") {
    backButton.style.display = "block";
  } else {
    backButton.style.display = "none";
  }
}

function executeSingleTest(testName: string, manualTest: boolean) {
  toggleVersionSelector();
  toggleBackButton();
  const action = () => manualTest? executeManualTestsInBrowser(testName): executeTestsInBrowser(testName);
  if (window.fdc3) {
    action();
  } else {
    window.addEventListener("fdc3Ready", action);
  }
}

function parseQueryString(queryString) {
  let queryParts = decodeURI(queryString.split('=')[1]).replace(/\\/g, "").split('_');
  let testName = queryParts[0] + ' 2.0';
  let manualTest = (queryParts[1] !== undefined && queryParts[1] !== '' && queryParts[1] === 'Manual') ? true: false;
  return {testName, manualTest};
}

const queryString = window.location.search;
if(queryString !== undefined && queryString !== '') {
  let testData = parseQueryString(queryString);
  let testName = testData.testName;
  let manualTest = testData.manualTest;
  executeSingleTest(testName, manualTest);
}
document.getElementById("runButton").addEventListener("click", executeTests);
document.getElementById("back-button").addEventListener("click", returnToTestSelection);
document.getElementById("manualTestsRunButton").addEventListener("click", executeManualTests);
