export type LogFunction = (message: string, data?: any) => void;
export declare function setLogger(newLogFunction: LogFunction): void;
export declare function log(message: string, data?: any): void;
