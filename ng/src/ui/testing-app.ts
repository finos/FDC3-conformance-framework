import Gherkin from "@cucumber/gherkin"
import Messages from "@cucumber/messages"

var uuidFn = Messages.IdGenerator.uuid();
var builder = new Gherkin.AstBuilder(uuidFn);
var matcher = new Gherkin.GherkinClassicTokenMatcher(); // or Gherkin.GherkinInMarkdownTokenMatcher()

var parser = new Gherkin.Parser(builder, matcher);
var gherkinDocument = parser.parse("Feature: ...");
var pickles = Gherkin.compile(
    gherkinDocument,
    "uri_of_the_feature.feature",
    uuidFn
);