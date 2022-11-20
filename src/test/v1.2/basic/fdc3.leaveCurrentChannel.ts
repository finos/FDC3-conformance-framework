import { assert } from "chai";
import APIDocumentation from "../../../apiDocuments";
import { DesktopAgent } from "fdc3_1_2/dist/api/DesktopAgent";

declare let fdc3: DesktopAgent;

export default () =>
  describe("fdc3.leaveCurrentChannel", () => {
    try {
      it("(BasicLC1) Method is callable", async () => {
        await fdc3.leaveCurrentChannel();
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
