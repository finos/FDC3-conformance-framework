# Mock Apps

The following are all mock apps used within the FDC3 conformance framework tests.

| Mock App Name | Used By                                                     |
| ------------- | ----------------------------------------------------------- |
| Channels      | fdc3.broadcast                                              |
| General       | fdc3.open                                                   |
| Intent-A      | fdc3.findIntent, fdc3.findIntentByContext, fdc3.raiseIntent |
| Intent-B      | fdc3.findIntent, fdc3.findIntentByContext, fdc3.raiseIntent |
| Intent-C      | fdc3.findIntent, fdc3.findIntentByContext, fdc3.raiseIntent |

The apps can be started in parallel via:

```sh
yarn start
```

## Mock App Configuration

It is the responsibility of the FDC3 application owner (the application under test) to ensure that these mock apps are configured correctly before the tests run. Examples of how to do this for some known FDC3 applications are below:

### Finsemble

After the installation, copy the json snippet from [snippet](./fdc3-app-config-examples/finsemble.app-d-snippet.txt) into `/public/configs/application/appd.json` under `appd`. This will add the test app and mock apps into the desktop container application under test, required for conformance testing.

## Mock App Closability

Some tests in some FDC3 applications require already open mock apps to be closed in some cases before they can successfully test assertions automatically. Unfortunately, the FDC3 API does not support closing of previously opened apps. The only way to work around this is to use the application specific API to close windows.

One example of this has been implemented in file [mock-functions.js](./mock-functions.js) for the [Finsemble application](https://documentation.finsemble.com/docs/welcome/introduction).

If you are testing against another application, **it is likely you will need to update this file**.
