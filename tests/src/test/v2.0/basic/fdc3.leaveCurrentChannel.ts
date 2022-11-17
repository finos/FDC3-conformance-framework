import { assert, expect } from "chai";
import APIDocumentation from "../../../apiDocuments";
import { DesktopAgent } from "fdc3_2_0/dist/api/DesktopAgent";

declare let fdc3: DesktopAgent;

export default () =>
  describe("fdc3.leaveCurrentChannel", () => {
    try {
      it("(2.0-BasicLC1) Method is callable", async () => {
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
