
import EventEmitter = require('events');
import { Log } from '../models/log.model';

class Logger {

  private static instance: Logger = null;
  private static eventEmitter: EventEmitter = null;

  private constructor() {
    Logger.eventEmitter = new EventEmitter();
    Logger.eventEmitter.on('log', Logger.processLog);
  }

  public static getInstance(): Logger {
    if (Logger.instance === null) {
      Logger.instance = new Logger();
    }

    return Logger.instance;
  }

  private static processLog(logInstance: Log): void {
    console[logInstance.severity](logInstance.toString());
  }

  public log(logInstance: Log): void {
    Logger.eventEmitter.emit('log', logInstance);
  }

}

export const logger: Logger = Logger.getInstance();
