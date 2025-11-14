import { LogLevel } from '../enums/log-level.enum';

export class GlobalConfig {

  public static logLevel: LogLevel = LogLevel.LOG;

  public static transformationOrderMap: {[key: string]: number} = {
    'await_call': 0,
    'remove_import': 0,
    'make_async': 0,
    'await_foreach_extern': 1,
    'await_foreach_return': 1,
    'await_foreach': 1,
    'await_map': 1,
    'insert_dynamic_import': 2,
    'insert_iife': 3,
    'make_getter_async': 3
  };

}
