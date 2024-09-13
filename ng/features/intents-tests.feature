Feature: FDC3 Raise Intents

  Background:
    Given A Desktop Agent in "api1"
    And "textContextX" is a context object with the following contents
      | type         |
      | textContextX |
    And the following apps are configured with the following behaviours
      | App | Usage                                                 | ListensFor (pattern: intent([context-types…]) (=> result-type))                               | On Startup                                                                        |
      | A   | Raise Intent tests without results                    | aTestingIntent(testContextX,testContextZ) sharedTestingIntent1(testContextX)                  | addIntentListener() for given intents                                             |
      | B   | Raise Intent tests with Context results               | bTestingIntent(testContextY) sharedTestingIntent1(testContextX, testContextY) => testContextY | addIntentListener() for given intents                                             |
      | C   | Find Intent tests (never started)                     | cTestingIntent(testContextX) => testContextZ                                                  | addIntentListener() for given intents                                             |
      | D   | Find Intent tests (never started)                     | sharedTestingIntent2(testContextX) => testContextZ                                            | addIntentListener() for given intents                                             |
      | E   | Find Intent & Raise Intent with Channel result        | sharedTestingIntent2(testContextY) => channel                                                 | addIntentListener() for given intents                                             |
      | F   | Find Intent & Raise Intent with PrivateChannel result | sharedTestingIntent2(testContextY) => channel<testContextZ> *                                 | addIntentListener() for given intents                                             |
      | G   | Find Intent tests (never started)                     | sharedTestingIntent2(testContextY)                                                            | addIntentListener() for given intents                                             |
      | H   | Raise Intent (bad config/behavior)                    | sharedTestingIntent2(testContextY) => testContextZ                                            | - no action                                                                       |
      | I   | Raise Intent (bad config/behavior)                    | sharedTestingIntent2(testContextY) => testContextZ                                            | addIntentListener(‘MadeUpIntent’, handler)                                        |
      | J   | PrivateChannels are private                           | privateChannelIsPrivate(privateChannelDetails) => privateChannelIsPrivateResult               | Tries to retrieve privateChannel sent in the privateChannelDetails context, fails |
      | K   | PrivateChannel lifecycle events                       | kTestingIntent(testContextX) => channel<testContextZ>                                         | addIntentListener() for given intents                                             |

  @FDC3-2.0
  Scenario: 2.0-RaiseIntentSingleResolve
    When I call "api1" with "raiseIntent" with parameters "aTestingIntent" and "{testContextX}"
    And I refer to {result} as "intentResolution"
    Then "{intentResoltion}" is an object with the following contents
      | source.appId | intent         | source.instanceId |
      | A            | aTestingIntent | <exists>          |
    And I call "intentResolution" with "getResult"
    And "{result}" is void
    And I can close the app with instanceId "{intentResoltion.source.instanceId}"
