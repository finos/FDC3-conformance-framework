import { assert, expect } from "chai";
import { AppIdentifier, Channel, IntentResolution, IntentResult, Listener } from "fdc3_2_0";
import { Context, DesktopAgent, getOrCreateChannel } from "fdc3_2_0";
import { APIDocumentation2_0 } from "../apiDocuments-2.0";
import constants from "../../../constants";
import { sleep, wait } from "../../../utils";
import { AppControlContext } from "../../common/channel-control";

declare let fdc3: DesktopAgent;
const raiseIntentDocs =
  "\r\nDocumentation: " + APIDocumentation2_0.raiseIntent + "\r\nCause";

export class IntentControl2_0 {
  async receiveContext(contextType: string, waitTime?: number): Promise<Context> {
    let timeout;
    const appControlChannel = await getOrCreateChannel("app-control");
    const messageReceived = new Promise<Context>(async (resolve, reject) => {
      const listener = await appControlChannel.addContextListener(
        contextType,
        (context) => {
          resolve(context);
          clearTimeout(timeout);
          listener.unsubscribe();
        }
      );

      //if no context received reject promise
      const { promise: sleepPromise, timeout: theTimeout } = sleep(waitTime ?? undefined);
      timeout = theTimeout;
      await sleepPromise;
      reject("No context received from app B");
    });

    return messageReceived;
  }

  async openIntentApp(appId): Promise<AppIdentifier> {
    try {
      return await fdc3.open({ appId: appId });
    } catch (ex) {
      assert.fail(
        `Error while attempting to open the mock app: ${ex.message ?? ex}`
      );
    }
  }

  async raiseIntent(
    intent: string,
    contextType: string,
    appIdentifier?: AppIdentifier,
    delayBeforeReturn?: number
  ): Promise<IntentResolution> {
    let context;
    if (delayBeforeReturn) {
      context = {
        type: contextType,
        delayBeforeReturn: delayBeforeReturn,
      };
    }

    try {
      if (appIdentifier) {
        return await fdc3.raiseIntent(intent, context, appIdentifier);
      } else {
        return await fdc3.raiseIntent(intent, context);
      }
    } catch (ex) {
      assert.fail(
        `Error while attempting to raise intent: ${ex.message ?? ex}`
      );
    }
  }

  async findInstances(appId: string): Promise<AppIdentifier[]> {
    try {
      return await fdc3.findInstances({ appId: appId });
    } catch (ex) {
      assert.fail(
        `Error while attempting to find instances: ${ex.message ?? ex}`
      );
    }
  }

  getIntentResult(intentResolution: IntentResolution): Promise<IntentResult> {
    return intentResolution.getResult().catch((ex) => {
      assert.fail(
        `Error while attempting to retrieve the IntentResult from the IntentResolution object: ${
          ex.message ?? ex
        }`
      );
    });
  }

  failIfIntentResultPromiseNotReceived() {
    let timeout = window.setTimeout(() => {
      assert.fail(
        "When running getIntentResult() the promise should be returned immediately unless it is being awaited"
      );
    }, 500);

    return timeout;
  }

  validateIntentResult(intentResult) {
    expect(typeof intentResult).to.be.equal("object");
    expect(intentResult).to.be.empty;
  }

  validateInstances(
    instances: AppIdentifier[],
    expectedInstances: number,
    expectedInstanceId: string
  ): void {
    expect(instances.length).to.be.equal(expectedInstances);
    expect(instances[0].instanceId).to.be.equal(expectedInstanceId);
  }

  validateIntentResolution = (
    appId: string,
    intentResolution: IntentResolution
  ) => {
    if (typeof intentResolution.source === "object") {
      expect(intentResolution.source as AppIdentifier).to.have.property(
        "appId"
      );
      expect(intentResolution.source as AppIdentifier).to.have.property(
        "instanceId"
      );
      expect(typeof intentResolution.source.instanceId).to.be.equal("string");
      expect(intentResolution.source.instanceId).to.not.be.equal("");
      expect((intentResolution.source as AppIdentifier).appId).to.eq(
        appId,
        raiseIntentDocs
      );
    } else assert.fail("Invalid intent resolution object");
  };

  async listenForError() {
    const appControlChannel = await getOrCreateChannel("app-control");
    appControlChannel.addContextListener(
      "error",
      (context: contextWithErrorMessage) => {
        assert.fail(context.errorMessage);
      }
    );
  }

  async closeIntentAppWindow(testId) {
    await broadcastCloseWindow(testId);
    const appControlChannel = await fdc3.getOrCreateChannel("app-control");
    await waitForContext("windowClosed", testId, appControlChannel);
    await wait(constants.WindowCloseWaitTime);
  }
}

const broadcastCloseWindow = async (currentTest) => {
  const appControlChannel = await fdc3.getOrCreateChannel("app-control");
  appControlChannel.broadcast({
    type: "closeWindow",
    testId: currentTest,
  } as AppControlContext);
};

const waitForContext = (
  contextType: string,
  testId: string,
  channel?: Channel
): Promise<Context> => {
  let executionListener: Listener;
  return new Promise<Context>(async (resolve) => {
    console.log(
      Date.now() +
        ` Waiting for type: "${contextType}", on channel: "${channel.id}" in test: "${testId}"`
    );

    const handler = (context: AppControlContext) => {
      if (testId) {
        if (testId == context.testId) {
          console.log(
            Date.now() + ` Received ${contextType} for test: ${testId}`
          );
          resolve(context);
          if (executionListener) executionListener.unsubscribe();
        } else {
          console.warn(
            Date.now() +
              ` Ignoring "${contextType}" context due to mismatched testId (expected: "${testId}", got "${context.testId}")`
          );
        }
      } else {
        console.log(
          Date.now() +
            ` Received (without testId) "${contextType}" for test: "${testId}"`
        );
        resolve(context);
        if (executionListener) executionListener.unsubscribe();
      }
    };

    if (channel === undefined) {
      executionListener = await fdc3.addContextListener(contextType, handler);
    } else {
      executionListener = await channel.addContextListener(
        contextType,
        handler
      );
      //App channels do not auto-broadcast current context when you start listening, so retrieve current context to avoid races
      const ccHandler = async (context: AppControlContext) => {
        if (context) {
          if (testId) {
            if (testId == context?.testId && context?.type == contextType) {
              console.log(
                Date.now() +
                  ` Received "${contextType}" (from current context) for test: "${testId}"`
              );
              if (executionListener) executionListener.unsubscribe();
              resolve(context);
            } //do not warn as it will be ignoring mismatches which will be common
            else {
              console.log(
                Date.now() +
                  ` CHecking for current context of type "${contextType}" for test: "${testId}" Current context did ${
                    context ? "" : "NOT "
                  } exist, 
had testId: "${context?.testId}" (${
                    testId == context?.testId ? "did match" : "did NOT match"
                  }) 
and type "${context?.type}" (${
                    context?.type == contextType ? "did match" : "did NOT match"
                  })`
              );
            }
          } else {
            console.log(
              Date.now() +
                ` Received "${contextType}" (from current context) for an unspecified test`
            );
            if (executionListener) executionListener.unsubscribe();
            resolve(context);
          }
        }
      };
      channel.getCurrentContext().then(ccHandler);
    }
  });
};

export interface contextWithErrorMessage extends Context {
    errorMessage?: string;
  }
  
  export interface DelayedReturnContext extends Context {
    delayBeforeReturn?: number;
  }

  export interface IntentAppBContext extends Context {
    delayBeforeReturn: number;
  }
  