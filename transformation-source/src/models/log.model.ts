import { LogLevel } from '../enums/log-level.enum';

export class Log {

  public constructor(
    private _severity: LogLevel,
    private _module: string,
    private _message: string,
    private _details: string,
    private _stackTrace: string
  ) { }

  public get severity(): LogLevel {
    return this._severity;
  }

  public get module(): string {
    return this._module;
  }

  public get message(): string {
    return this._message;
  }

  public get details(): string {
    return this._details;
  }

  public get stackTrace(): string {
    return this._stackTrace;
  }

  public toString(): string {
    let logString: string = `[${this.severity.toUpperCase()}: ${this.module}: ${this.message}]`;
    if (this.details) {
      logString += `\n${this.details}`;
    }
    if (this.stackTrace) {
      logString += `\n${this.stackTrace}`;
    }
    return logString;
  }

  public static Builder: any = class Builder {

    private severity: LogLevel;
    private module: string;
    private message: string;
    private details: string;
    private stackTrace: string;

    public withSeverity(severity: LogLevel): Builder {
      this.severity = severity;
      return this;
    }


    public withModule(module: string): Builder {
      this.module = module;
      return this;
    }

    public withMessage(message: string): Builder {
      this.message = message;
      return this;
    }

    public withDetails(details: string): Builder {
      this.details = details;
      return this;
    }

    public withStackTrace(stackTrace: string): Builder {
      this.stackTrace = stackTrace;
      return this;
    }

    public build(): Log {
      return new Log(this.severity, this.module, this.message, this.details, this.stackTrace);
    }

  };


}
