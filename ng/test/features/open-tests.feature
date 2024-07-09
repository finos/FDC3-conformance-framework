Feature: FDC3 Open
App A calls a function (see below) to open a second app, B

  Background:
    Given A Desktop Agent in "api1"
    And "AppB" is the ID of an FDC3 Application named "AppBName"

  @FDC3-1.2
  Scenario: AOpensB1
    When I call "api1" with "open" with parameter "AppBName"
    Then "{result}" is an object with the following contents
      | appIdentifier | instanceId |
      | AppB          | <exists>   |
    And I receive an "app-opened" event with appId "AppB"
    And I can close the app with instanceId "{result.instanceId}"
