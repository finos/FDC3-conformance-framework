import APIDocumentation from "../apiDocuments";

const getCurrentChannelDocs =
  "\r\nDocumentation: " + APIDocumentation.getCurrentChannel + "\r\nCause";

export default () =>
  describe("fdc3.getCurrentChannel", () => {
    it("Method is callable", async () => {
      await window.fdc3.getCurrentChannel();
    });

    it("getCurrentChannel() returns null if no channel has been joined", async () => {
      const channel = await window.fdc3.getCurrentChannel();
      expect(channel).to.be.null;
    });
  });
