import { onFdc3Ready } from "./mock-functions";
import { wait } from "../../utils";
import constants from "../../constants";

// used in AOpensBNoListen
onFdc3Ready().then(async () => {
  await wait(constants.NoListenerTimeout); // make sure no listener is added until timeout is exceeded
  window.close();
});
