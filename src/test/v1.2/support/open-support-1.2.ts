import { assert, expect } from "chai";
import { Context, DesktopAgent, Listener, OpenError, TargetApp } from "fdc3_1_2";
import constants from "../../../constants";
import { ContextSender } from "../../../mock/v1.2/general";
import { sleep } from "../../../utils";
import { AppControlContext } from "../../../context-types";
import { OpenControl } from "../../common/control/open-control";
import { APIDocumentation1_2 } from "../apiDocuments-1.2";
import { closeMockAppWindow, waitForContext } from "../fdc3-1_2-utils";

declare let fdc3: DesktopAgent;
const openDocs = "\r\nDocumentation: " + APIDocumentation1_2.open + "\r\nCause:";

export class OpenControl1_2 implements OpenControl<Context> {
  contextReceiver = async (contextType: string, expectNotToReceiveContext?: boolean): Promise<Context> => {
    const appControlChannel = await fdc3.getOrCreateChannel(constants.ControlChannel);
    const messageReceived = new Promise<Context>(async (resolve, reject) => {
      const listener = appControlChannel.addContextListener(contextType, async (context: AppControlContext) => {
        if (context.errorMessage) {
          reject(context.errorMessage);
        } else {
          resolve(context);
        }

        listener.unsubscribe();
      });

      const { promise: thePromise } = sleep(); //if no context received reject promise
      await thePromise;
      if (!expectNotToReceiveContext) {
        reject(new Error("No context received from app B"));
      } else {
        resolve({ type: "noContextReceived" });
      }
    });
    return messageReceived;
  };

  openMockApp = async (appName: string, appId?: string, contextType?: string, targetAppAsString?: boolean, malformedContext?: boolean) => {
    let targetApp: TargetApp;
    let context: Context;

    if (malformedContext) {
      // @ts-ignore
      await fdc3.open(appName, { name: "this is a malformed context" });
    } else {
      //set TargetApp parameter
      if (appId) {
        targetApp = { name: appName, appId: appId };
      } else if (targetAppAsString) {
        targetApp = appName;
      } else {
        targetApp = { name: appName };
      }

      //set context parameter
      if (contextType) {
        context = { type: contextType, name: "context" };
        await fdc3.open(targetApp, context);
      } else {
        await fdc3.open(targetApp);
      }
    }
  };

  async closeMockApp(testId: string) {
    await closeMockAppWindow(testId);
  }

  addListenerAndFailIfReceived = async () => {
    const appControlChannel = await fdc3.getOrCreateChannel(constants.ControlChannel);
    await appControlChannel.addContextListener("context-received", (context: AppControlContext) => {
      assert.fail(context.errorMessage);
    });
  };

  confirmAppNotFoundErrorReceived = (exception: DOMException) => {
    expect(exception).to.have.property("message", OpenError.AppNotFound, openDocs);
  };

  validateReceivedContext = async (context: ContextSender, expectedContextType: string): Promise<void> => {
    expect(context.context.name).to.eq("context", openDocs);
    expect(context.context.type).to.eq(expectedContextType, openDocs);
  };
}
