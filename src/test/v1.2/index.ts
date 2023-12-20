import { getPackMembers, getPackNames, executeTestsInBrowser } from "./testSuite";

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

function returnToTestSelection() {
  location.href = '/v1.2/app/index.html';
}

function toggleVersionSelector() {
  const versionSelector = document.getElementById("version-selector");
  if (versionSelector.style.display === "none") {
    versionSelector.style.display = "block";
  } else {
    versionSelector.style.display = "none";
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

function executeSingleTest(testName: string) {
  toggleVersionSelector();
  toggleBackButton();
  const action = () => executeTestsInBrowser(testName);
  if (window.fdc3) {
    action();
  } else {
    window.addEventListener("fdc3Ready", action);
  }
}

function parseQueryString(queryString: string) {
  let queryParts = decodeURI(queryString.split('=')[1]).replace(/\\/g, "").split('_');
  let testName = queryParts[0] + ' 1.2';
  return testName;
}

const queryString = window.location.search;
if(queryString !== undefined && queryString !== '') {
  let testName = parseQueryString(queryString);
  executeSingleTest(testName);
}

document.getElementById("runButton").addEventListener("click", executeTests);
document.getElementById("back-button").addEventListener("click", returnToTestSelection);
