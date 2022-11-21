export * from "./testSuite";
import { getPackMembers, getPackNames, executeTestsInBrowser } from "./testSuite";

require('mocha/mocha.css');

require('source-map-support/browser-source-map-support.js')


mocha.setup('bdd');
const version = document.getElementById("version")

// populate drop-down
getPackNames().forEach(pn => {
  const optGroup = document.createElement("optgroup")
  optGroup.setAttribute("label", pn);
  getPackMembers(pn).forEach(pm => {
    const opt = document.createElement("option")
    const text = document.createTextNode(pm)
    opt.setAttribute("value", pm);
    opt.appendChild(text)
    optGroup.appendChild(opt)
  })
  version.appendChild(optGroup);
})

function executeTests() {
  hideVersionSelector();
  const fdc3Versions = document.getElementById("version") as HTMLSelectElement;
  var selectedVersion = fdc3Versions.options[fdc3Versions.selectedIndex].innerHTML;
  const action = () => executeTestsInBrowser(selectedVersion);
  if (window.fdc3) {
    action();
  } else {
    window.addEventListener('fdc3Ready', action);
  }
}

function hideVersionSelector() {
  const versionSelector = document.getElementById("version-selector");
  if (versionSelector.style.display === "none") {
    versionSelector.style.display = "block";
  } else {
    versionSelector.style.display = "none";
  }
}

document.getElementById("runButton").addEventListener("click", executeTests);