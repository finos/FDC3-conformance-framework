import { loadFeature, describeFeature } from "@amiceli/vitest-cucumber"
import { Feature } from "@amiceli/vitest-cucumber/dist/parser/feature"

const feature1 = await loadFeature('features/intents-tests.feature') as Feature

describeFeature(feature1, ({ Scenario }) => {

    Scenario('Something', ({ Given, When, Then }) => {

        setupGenericSteps(Given, When, Then)

        // idk

    })




})