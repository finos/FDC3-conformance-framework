import { assert } from "chai";
import APIDocumentation from "../../apiDocuments";

export default () =>
  describe("fdc3.leaveCurrentChannel", () => {
    try {
      it("Method is callable", async () => {
        await window.fdc3.leaveCurrentChannel();
      });
    } catch (ex) {
      assert.fail(
        "\r\nDocumentation: " +
          APIDocumentation.leaveCurrentChannel +
          "\r\nCause" +
          (ex.message ?? ex)
      );
    }
  });
