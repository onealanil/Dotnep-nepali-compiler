/**
 * @file logger.ts
 * @description This module provides a simple logging utility that can be customized by the user.
 * @author Anil Bhandari
 */
export type LogFunction = (message: string, data?: any) => void;

let logFunction: LogFunction = () => { };

/**
 * @function setLogger
 * @description Sets a custom logging function that will be used for logging messages.
 * @param newLogFunction The custom logging function to be used.
 */
export function setLogger(newLogFunction: LogFunction) {
    logFunction = newLogFunction;
}

/**
 * 
 * @description This function logs a message using the current logging function.
 * It can be used to log messages to the console, a file, or any other destination.
 * @param message - The message to be logged.
 * @param data - Optional additional data to be logged.
 * @returns void
 */
export function log(message: string, data?: any) {
    logFunction(message, data);
}
