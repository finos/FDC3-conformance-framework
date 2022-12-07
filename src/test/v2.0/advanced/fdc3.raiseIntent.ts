import {
    Channel,
    Context,
    getOrCreateChannel,
    IntentResolution,
    Listener,
    AppIdentifier,
    ResolveError,
    DesktopAgent,
    ChannelError,
    PrivateChannel,
  } from "fdc3_2_0";
  import { assert, expect } from "chai";
  import { APIDocumentation2_0 } from "../apiDocuments-2.0";
  import constants from "../../../constants";
  import { sleep, wait, wrapPromise } from "../../../utils";
  import { IntentKContext } from "../../../mock/v2.0/intent-k";
  import { IntentControl2_0 } from "./intent-support-2.0";
  
  declare let fdc3: DesktopAgent;
  const raiseIntentDocs =
    "\r\nDocumentation: " + APIDocumentation2_0.raiseIntent + "\r\nCause";
    const control = new IntentControl2_0();
  
  /**
   * Details on the mock apps used in these tests can be found in /mock/README.md
   */
  export default () =>
    describe("fdc3.raiseIntent", () => {
      afterEach(async function afterEach() {
        await control.closeIntentAppWindow(this.currentTest.title);
      });
  
      const RaiseIntentSingleResolve =
        "(2.0-RaiseIntentSingleResolve) Should start app intent-a when raising intent 'aTestingIntent' with context 'testContextX'";
      it(RaiseIntentSingleResolve, async () => {
          await control.listenForError();
          const result = control.receiveContext("fdc3-intent-a-opened");
          const intentResolution = await control.raiseIntent("aTestingIntent", "testContextX");
          control.validateIntentResolution("IntentAppAId", intentResolution);
          await result;
      });
  
      const RaiseIntentTargetedAppResolve =
        "(2.0-RaiseIntentTargetedAppResolve) Should start app intent-a when raising intent 'aTestingIntent' with context 'testContextX'";
      it(RaiseIntentTargetedAppResolve, async () => {
        await control.listenForError();
        const result = control.receiveContext("fdc3-intent-a-opened");
        const intentResolution = await control.raiseIntent("sharedTestingIntent1", "testContextX", { appId: "IntentAppBId"});
        control.validateIntentResolution("IntentAppBId", intentResolution);
        await result;
      });
  
      const RaiseIntentTargetedInstanceResolveOpen =
        "(2.0-RaiseIntentTargetedInstanceResolveOpen) Should target running instance of intent-a app when raising intent 'aTestingIntent' with context 'testContextX' after opening intent-a app";
      it(RaiseIntentTargetedInstanceResolveOpen, async () => {
        await control.listenForError();
        const appIdentifier = await control.openIntentApp("IntentAppAId");
        const result = control.receiveContext("fdc3-intent-a-opened");
        const intentResolution = await control.raiseIntent("aTestingIntent", "testContextX", appIdentifier);  
        control.validateIntentResolution("IntentAppAId", intentResolution);
        await result;
        const instances = await control.findInstances("IntentAppAId");
        control.validateInstances(instances, 1, appIdentifier.instanceId);
      });
  
      const RaiseIntentTargetedInstanceResolveFindInstances =
        "(2.0-RaiseIntentTargetedInstanceResolveFindInstances) Should start app intent-a when targeted by raising intent 'aTestingIntent' with context 'testContextX'";
      it(RaiseIntentTargetedInstanceResolveFindInstances, async () => {
        await control.listenForError();
        const appIdentifier = await control.openIntentApp("IntentAppAId");
        const instances = await control.findInstances("IntentAppAId");
        control.validateInstances(instances, 1, appIdentifier.instanceId);
        const result = control.receiveContext("fdc3-intent-a-opened");
        const intentResolution = await control.raiseIntent("aTestingIntent", "testContextX", appIdentifier);  
        control.validateIntentResolution("IntentAppAId", intentResolution);
        await result;

        //make sure no other instance is started
        const instances2 = await control.findInstances("IntentAppAId");
        expect(instances2.length).to.be.equal(1);
      });

      const RaiseIntentVoidResult0secs = "(2.0-RaiseIntentVoidResult0secs) App A receives a void IntentResult";
      it(RaiseIntentVoidResult0secs, async () => {
        await control.listenForError();
        const intentResolution = await control.raiseIntent("aTestingIntent", "testContextX")
        control.validateIntentResolution("IntentAppAId", intentResolution);
        let intentResult = await control.getIntentResult(intentResolution);
        control.validateIntentResult(intentResult);  
      });
  
      // THIS TEST DOESN'T MAKE SENSE: The returned intentResult is always void/an empty object. therefore its state never changes, either before or after the intent listener returns
      const RaiseIntentVoidResult5secs = "(2.0-RaiseIntentVoidResult5secs) App A receives a void IntentResult after a 5 second delay";
      it(RaiseIntentVoidResult5secs, async () => {
        await control.listenForError();
        let receiver = control.receiveContext("context-received", 8000);
        const intentResolution = await control.raiseIntent("aTestingIntent", "testContextX", undefined, 5000)
        control.validateIntentResolution("IntentAppAId", intentResolution);

        //ensure getIntentResult immediately returns a promise that can be awaited
        let timeout = control.failIfIntentResultPromiseNotReceived();
        let intentResult = control.getIntentResult(intentResolution);
        clearTimeout(timeout);
        await receiver;

        //give app b time to return
        await wait(300);
        await intentResult;
        control.validateIntentResult(intentResult);  
      });
  
      //TEST DOESN'T MAKE SENSE: see test above
      const RaiseIntentVoidResult61secs = "(2.0-RaiseIntentVoidResult61secs) App A receives a void IntentResult after a 61 second delay";
      it(RaiseIntentVoidResult61secs, async () => {
        await control.listenForError();
        let receiver = control.receiveContext("context-received", 64000);
        const intentResolution = await control.raiseIntent("aTestingIntent", "testContextX", undefined, 61000)
        control.validateIntentResolution("IntentAppAId", intentResolution);

        //ensure getIntentResult immediately returns a promise that can be awaited
        let timeout = control.failIfIntentResultPromiseNotReceived();
        let intentResult = control.getIntentResult(intentResolution);
        clearTimeout(timeout);
        await receiver;

        //give app b time to return
        await wait(300);
        await intentResult;
        control.validateIntentResult(intentResult);  
      }).timeout(64000);

      const RaiseIntentContextResult0secs =
        "(2.0-RaiseIntentContextResult0secs) IntentResult resolves to testContextY";
      it.only(RaiseIntentContextResult0secs, async () => {
        await control.listenForError();
        const intentResolution = await control.raiseIntent("sharedTestingIntent1", "testContextY");
        validateIntentResolution("IntentAppAId", intentResolution);

        //ensure getIntentResult immediately returns a promise that can be awaited
        let timeout = control.failIfIntentResultPromiseNotReceived();
        let intentResult = control.getIntentResult(intentResolution);
        clearTimeout(timeout);

        await intentResult;
        control.validateIntentResult(intentResult, "testcontextY");  
      });
  
      const RaiseIntentContextResult5secs =
        "(2.0-RaiseIntentContextResult5secs) IntentResult resolves to testContextY instance after a 5 second delay";
      it.only(RaiseIntentContextResult5secs, async () => {
        await control.listenForError();
        let receiver = control.receiveContext("context-received", 8000);
        const intentResolution = await control.raiseIntent("sharedTestingIntent1", "testContextY", undefined, 5000);
        validateIntentResolution("IntentAppAId", intentResolution);

        //ensure getIntentResult immediately returns a promise that can be awaited
        let timeout = control.failIfIntentResultPromiseNotReceived();
        let intentResult = control.getIntentResult(intentResolution);
        clearTimeout(timeout);
        //await receiver;

        //give app b time to return
        await wait(300);
        await intentResult;
        control.validateIntentResult(intentResult, "testcontextY");  
      });
  
      const RaiseIntentContextResult61secs =
        "(2.0-RaiseIntentContextResult61secs) ";
      it(RaiseIntentContextResult61secs, async () => {
        //raise intent
        const intentResolution = await fdc3.raiseIntent("sharedTestingIntent1", {
          type: "testContextX",
          delayBeforeReturn: 0,
        } as IntentAppBContext);
  
        validateIntentResolution("IntentAppAId", intentResolution);
  
        let intentResult = await intentResolution.getResult().catch((ex) => {
          assert.fail(
            `Error when calling IntentResolution.getResult() ${ex.message ?? ex}`
          );
        });
  
        let timeout;
        const appControlChannel = await getOrCreateChannel("app-control");
        const wrapper = wrapPromise();
  
        //receive context from intent app b
        await appControlChannel.addContextListener(
          "testContextX",
          async (context) => {
            wrapper.resolve();
            clearTimeout(timeout);
          }
        );
  
        timeout = window.setTimeout(() => {
          wrapper.reject("Did not receive testContextX back from intent app b");
        }, 71000);
  
        await wrapper.promise;
  
        //intentResult should resolve to the testContextX instance
        console.log(JSON.stringify(intentResult));
        expect(
          intentResult,
          "IntentResolution did not resolve to the testContextX instance"
        ).to.have.property("type");
        expect(
          intentResult.type,
          "IntentResolution did not resolve to the testContextX instance"
        ).to.be.equal("testContextX");
  
        await closeIntentAppsWindows(RaiseIntentContextResult61secs);
      }).timeout(80000);
  
      const RaiseIntentChannelResult = "(2.0-RaiseIntentChannelResult) ";
      it(RaiseIntentChannelResult, async () => {
        //raise intent
        const intentResolution = await fdc3.raiseIntent("sharedTestingIntent2", {
          type: "testContextY",
        }, {appId: "IntentAppEId"});
  
        validateIntentResolution("IntentAppEId", intentResolution);
  
        let intentResult = await intentResolution.getResult().catch((ex) => {
          assert.fail(
            `Error when calling IntentResolution.getResult() ${ex.message ?? ex}`
          );
        });
  
        //wait for intent-e to return channel
        await wait();
  
        expect(intentResult).to.have.property("id");
        expect(intentResult).to.have.property("type");
  
        expect(intentResult.type).to.be.equal("app");
        expect(intentResult.id).to.be.equal("test-channel");
  
        const channel = <Channel>intentResult;
  
        let timeout;
        const wrapper = wrapPromise();
        await channel.addContextListener("testContextZ", (context)=>{
          expect(context.id).to.be.equal({key: "uniqueId"});
          wrapper.resolve();
          clearTimeout(timeout);
        });
  
        timeout = window.setTimeout(() => {
          wrapper.reject("Did not receive testContextZ back from intent app e");
        }, 10000);
  
        await wrapper.promise;
        await closeIntentAppsWindows(RaiseIntentChannelResult);
      });
  
      const RaiseIntentPrivateChannelResult = "(2.0-RaiseIntentPrivateChannelResult) ";
      it(RaiseIntentPrivateChannelResult, async () => {
        //raise intent
        const intentResolution = await fdc3.raiseIntent("sharedTestingIntent2", {
          type: "testContextY",
        }, {appId: "IntentAppFId"});
  
        validateIntentResolution("IntentAppFId", intentResolution);
  
        let intentResult = await intentResolution.getResult().catch((ex) => {
          assert.fail(
            `Error when calling IntentResolution.getResult() ${ex.message ?? ex}`
          );
        });
  
        //wait for intent-e to return channel
        await wait();
  
        expect(intentResult).to.have.property("type");
        expect(intentResult).to.have.property("onAddContextListener");
        expect(intentResolution).to.have.property("onUnsubscribe");
        expect(intentResolution).to.have.property("onDisconnect");
        expect(intentResolution).to.have.property("disconnect");
  
        expect(intentResult.type).to.be.equal("private");
  
        const channel = <Channel>intentResult;
  
        let timeout;
        const wrapper = wrapPromise();
        await channel.addContextListener("testContextZ", (context)=>{
          expect(context.id).to.be.equal({key: "uniqueId"});
          wrapper.resolve();
          clearTimeout(timeout);
        });
  
        timeout = window.setTimeout(() => {
          wrapper.reject("Did not receive testContextZ back from intent app e");
        }, 10000);
  
        await wrapper.promise;
        await closeIntentAppsWindows(RaiseIntentPrivateChannelResult);
      });
  
      const PrivateChannelsAreNotAppChannels = "(2.0-PrivateChannelsAreNotAppChannels) ";
      it(PrivateChannelsAreNotAppChannels, async () => {
        const privChan = await fdc3.createPrivateChannel();
        expect(privChan).to.have.property("id");
        const privChan2 = await fdc3.createPrivateChannel();
        expect(privChan2).to.have.property("id");
  
        //confirm that the ids of both private channels are different
        expect(privChan.id).to.not.be.equal(privChan2.id);
  
        try {
          await fdc3.getOrCreateChannel(privChan.id);
          assert.fail("No error was not thrown when calling fdc3.getOrCreateChannel(privateChannel.id)");
        } catch (ex) {
          expect(ex).to.have.property("message", ChannelError.AccessDenied, `Incorrect error received when calling fdc3.getOrCreateChannel(privateChannel.id). Expected AccessDenied, got ${ex.message}`);
        }
  
        const intentResolution = await fdc3.raiseIntent("privateChanneliIsPrivate", {type: "privateChannelId", id: {key: privChan2.id}});
  
        let result = await intentResolution.getResult();
  
        await wait();
  
        expect(result).to.have.property("id");
        expect(result.id).to.be.equal("privateChanneliIsPrivate");
        expect(result).to.have.property("type");
        expect(result.type).to.be.equal("private");
  
        await closeIntentAppsWindows(PrivateChannelsAreNotAppChannels);
      });
  
      const PrivateChannelsLifecycleEvents = "(2.0-PrivateChannelsLifecycleEvents) ";
      it(PrivateChannelsLifecycleEvents, async () => {
        const intentResolution = await fdc3.raiseIntent("kTestingIntent", {type: "testContextX"}, {appId: "IntentAppKId"});
  
        expect(intentResolution.source).to.have.property("appId");
        expect(intentResolution.source.appId).to.be.equal("IntentAppKId");
        expect(intentResolution.source).to.have.property("instanceId");
        expect(intentResolution.source.instanceId).to.not.be.null;
        expect(intentResolution.source.instanceId).to.not.be.equal("");
  
        let result = await intentResolution.getResult();
  
        await wait();
        expect(result).to.have.property("type");
        expect(result).to.have.property("onAddContextListener");
        expect(result).to.have.property("onUnsubscribe");
        expect(result).to.have.property("onDisconnect");
        expect(result).to.have.property("disconnect");
        expect(result).to.have.property("id");
        expect(result).to.have.property("type");
        expect(result.type).to.be.equal("private");
  
        const privChannel = <PrivateChannel>result;
  
        let numberStream = 1;
        let timeout;
        const wrapper = wrapPromise();
  
        //receive multiple contexts in succession from intent-k
        const listener = await privChannel.addContextListener("testContextZ", (context: IntentKContext)=>{
          expect(context.number).to.be.equal(numberStream);
          numberStream += 1;
          expect(context.type).to.be.equal("testContextZ");
  
          if(numberStream === 5){
            wrapper.resolve;
            clearTimeout(timeout);
          }
        });
  
        timeout = await window.setTimeout(() => {
          wrapper.reject("test timed-out while listening for five contexts to be broadcast from the intent-k app in short succession");
        }, constants.WaitTime);
  
        await wrapper.promise;
  
        //unsubscribe the listener
        listener.unsubscribe();
        let timeout2;
        const wrapper2 = wrapPromise();
  
        const listener2 = await privChannel.addContextListener("testContextZ", (context: IntentKContext)=>{
          expect(context.onUnsubscribedTriggered).to.be.equal(true);
          wrapper2.resolve;
          clearTimeout(timeout2);
        });
  
        timeout2 = await window.setTimeout(() => {
          wrapper.reject("test timed-out while awaiting confirmation that onUnsubscribe was triggered");
        }, constants.WaitTime);
  
        await wrapper.resolve;
  
        //step 14
  
      });
    });
  
  const validateIntentResolution = (
    appId: string,
    intentResolution: IntentResolution
  ) => {
    if (typeof intentResolution.source === "object") {
      expect(intentResolution.source as AppIdentifier).to.have.property("appId");
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
  
  const broadcastCloseWindow = async (currentTest) => {
    const appControlChannel = await fdc3.getOrCreateChannel("app-control");
    appControlChannel.broadcast({
      type: "closeWindow",
      testId: currentTest,
    } as AppControlContext);
  };
  
  // creates a channel and subscribes for broadcast contexts. This is
  // used by the 'mock app' to send messages back to the test runner for validation
  const createReceiver = async (contextType: string) => {
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
      const { promise: sleepPromise, timeout: theTimeout } = sleep();
      timeout = theTimeout;
      await sleepPromise;
      reject(new Error("No context received from app B"));
    });
  
    console.log("listener added");
  
    return messageReceived;
  };
  
  async function closeIntentAppsWindows(testId) {
    await broadcastCloseWindow(testId);
    const appControlChannel = await fdc3.getOrCreateChannel("app-control");
    await waitForContext("windowClosed", testId, appControlChannel);
    await wait(constants.WindowCloseWaitTime);
  }
  
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
  
  interface AppControlContext extends Context {
    testId: string;
  }
  
  export interface IntentAppBContext extends Context {
    delayBeforeReturn: number;
  }