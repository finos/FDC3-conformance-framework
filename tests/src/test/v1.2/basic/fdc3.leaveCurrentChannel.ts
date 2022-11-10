import { assert } from "chai";
import APIDocumentation from "../../../apiDocuments";
import { DesktopAgent } from "fdc3_1_2/dist/api/DesktopAgent";

export default () =>
  describe("fdc3.leaveCurrentChannel", () => {
    try {
      it("Method is callable", async () => {
        await (<DesktopAgent>(<unknown>window.fdc3)).leaveCurrentChannel();
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
