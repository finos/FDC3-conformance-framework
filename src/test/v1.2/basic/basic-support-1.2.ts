import { assert, expect } from "chai";
import { Channel, Context, DesktopAgent, Listener, OpenError, TargetApp } from "fdc3_1_2";
import { InfoControl } from "../../common/control/info-control";
import { APIDocumentation1_2 } from "../apiDocuments-1.2";

declare let fdc3: DesktopAgent;


export class BasicControl1_2 implements InfoControl<Context> {

 getInfo = () =>  {
    const info = fdc3.getInfo();
    return info;
  }
  
  
}
