import APIDocumentation from "../apiDocuments";

const getInfoDocs =
  "\r\nDocumentation: " + APIDocumentation.getInfo + "\r\nCause";

export default () =>
  describe("fdc3.getInfo", () => {
    it("Method is callable", async () => {
      await window.fdc3.getInfo();
    });
  });
