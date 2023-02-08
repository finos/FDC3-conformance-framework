import { assert, expect } from "chai";
import { Channel, Context, DesktopAgent, Listener, OpenError } from "fdc3_2_0";
import { BasicControl } from "../../common/basic/basic-control";

declare let fdc3: DesktopAgent;


export class BasicControl2_0 implements BasicControl<Context> {

 getInfo =  async () =>  {
    const info = await fdc3.getInfo();
    return info;
  } 
  
}
