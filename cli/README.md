# Running the tests from the command line

## Integration with automated testing

The test suite can be run independently without interaction - for example as part of a CI build, or from the command line. See JavaScript example [here](./testRunner/examples/). The test runner can be used as a module to run the compliance test suite.
Perform the following steps to include the module in your code:
- Import the fdc3-compliance module: ```yarn add @fdc3-compliance/test```
- Import/require the ```@fdc3-compliance/test``` module in your code
- Call the ```runSilentTests``` function, passing in the fdc3 implementation to be tested

Example:
```javascript
const { runSilentTests } = require("@finos/fdc3-conformance-tests");

// Pass in the fdc3 global object to be tested
// Results are returned via callback
runSilentTests(fdc3, (results) => {
  // results.stats contains the summary results
  // For more details, see the passed and failed arrays
  console.log(results.stats);
});
```

The included example code can be run with the following command line:
```bash
node examples/ci-test.js
```
