# Mock Apps

The following are all mock apps used within the FDC3 conformance framework tests.

| Mock App Name | Used By                                                     |
| ------------- | ----------------------------------------------------------- |
| Channels      | fdc3.broadcast                                              |
| General       | fdc3.open                                                   |
| Intent-A      | fdc3.findIntent, fdc3.findIntentByContext, fdc3.raiseIntent |
| Intent-B      | fdc3.findIntent, fdc3.findIntentByContext, fdc3.raiseIntent |
| Intent-C      | fdc3.findIntent, fdc3.findIntentByContext, fdc3.raiseIntent |

The apps can be started parallely via:

```sh
yarn start
```

It is the responsbility of the FDC3 application owner (the application under test) to ensure that these mock apps are configured correctly before the tests run. Examples of how to do this for some known FDC3 applications are below:

## Finsemble

After the installation, copy the json snippet from [snippet](./fdc3-app-config-examples/finsemble.app-d-snippet.txt) into `/public/configs/application/appd.json` under `appd`. This will add the test app and mock apps into the desktop container application under test, required for conformance testing.
