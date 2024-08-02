export type LogFunction = (message: string, data?: any) => void;

let logFunction: LogFunction = () => {};

export function setLogger(newLogFunction: LogFunction) {
    logFunction = newLogFunction;
}

export function log(message: string, data?: any) {
    logFunction(message, data);
}
