[![FINOS - Incubating](https://cdn.jsdelivr.net/gh/finos/contrib-toolbox@master/images/badge-incubating.svg)](https://finosfoundation.atlassian.net/wiki/display/FINOS/Incubating)

# FDC3 Conformance Framework

A framework for testing whether desktop containers implement the [FDC3 standard](https://fdc3.finos.org/).

This project currently targets FDC3 v1.2.

## Installation

This repository currently contains:

 - `tests` - the FDC3 conformance tests, implemented using Mocha / TypeScript, making use of the FDC3 type definitions, [@finos/fdc3](https://www.npmjs.com/package/@finos/fdc3).
 - `app` - A simple application that hosts the tests, allowing them to be executed from within a desktop container.
 - `mock` - Multiple mock applications that are used to verify conformance - [details](./mock/README.md)

In order to get started, install all the dependencies with:

```sh
yarn
```

Then build all the components with:

```sh
yarn build
```

The server(s) can be started as follows:

```sh
// Start the app which runs the tests
cd app
yarn start

// Start all the mock apps which the tests will make use of
cd mock
yarn start
```

The application will start and will open a webbrowser tab, this tab will have an error. The reason is that the app does not have a Window.FDC3 object and should be ran through the desktop agent.

Here is the setup steps for the following desktop agents:

## Contributing

1. Fork this repository
2. Create your feature branch (`git checkout -b feature/fooBar`)
3. Read our [contribution guidelines](CONTRIBUTING.md) and [Community Code of Conduct](https://www.finos.org/code-of-conduct)
4. Commit your changes (`git commit -am 'Add some fooBar'`)
5. Push to the branch (`git push origin feature/fooBar`)
6. Create a new Pull Request

_NOTE:_ Commits and pull requests to FINOS repositories will only be accepted from those contributors with an active, executed Individual Contributor License Agreement (ICLA) with FINOS OR who are covered under an existing and active Corporate Contribution License Agreement (CCLA) executed with FINOS. Commits from individuals not covered under an ICLA or CCLA will be flagged and blocked by the FINOS Clabot tool (or [EasyCLA](https://github.com/finos/community/blob/master/governance/Software-Projects/EasyCLA.md)). Please note that some CCLAs require individuals/employees to be explicitly named on the CCLA.

*Need an ICLA? Unsure if you are covered under an existing CCLA? Email [help@finos.org](mailto:help@finos.org)*


## License

Copyright 2022 FINOS 

Distributed under the [Apache License, Version 2.0](http://www.apache.org/licenses/LICENSE-2.0).

SPDX-License-Identifier: [Apache-2.0](https://spdx.org/licenses/Apache-2.0)
