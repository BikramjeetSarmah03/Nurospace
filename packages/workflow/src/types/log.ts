export const LogLevels = ["info", "error"] as const;
export type ILogLevel = (typeof LogLevels)[number];

export type ILog = {
  message: string;
  timestamp: Date;
  level: ILogLevel;
};

export type LogFunction = (message: string) => void;

export type LogCollector = {
  getAll(): ILog[];
} & {
  [K in ILogLevel]: LogFunction;
};

export type IExecutionLog = {
  id: string;
  executionPhase: string;
  logLevel: ILogLevel;
  message: string;
  timestamp: Date;
};
