export class ErrorPageBody {
    errorMsg : string | undefined = undefined;
    icon : string | undefined = undefined;
    constructor(errorMsg:string, icon:string)
    {
        this.errorMsg=errorMsg;
        this.icon=icon;
    }
  }