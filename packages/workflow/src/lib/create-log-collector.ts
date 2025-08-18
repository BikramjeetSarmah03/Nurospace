import {
  LogLevels,
  type ILog,
  type ILogLevel,
  type LogCollector,
  type LogFunction,
} from "../types/log";

export const createLogCollector = (): LogCollector => {
  const logs: ILog[] = [];

  const getAll = () => logs;

  const logFunctions = {} as Record<ILogLevel, LogFunction>;
  LogLevels.forEach((level) => {
    logFunctions[level] = (message: string) => {
      logs.push({ message, level, timestamp: new Date() });
    };
  });

  return {
    getAll,
    ...logFunctions,
  };
};
