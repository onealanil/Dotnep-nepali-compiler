/**
 * @file CustomErrors.ts
 * @description This file contains custom error classes for the parser.
 * It defines a CustomError class that extends the built-in Error class.
 * This class can be used to create custom error messages for the parser.
 * It can be used to throw errors with a specific message and name.
 * It can also be used to catch errors and handle them in a specific way.
 */
class CustomError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "CustomError";
    }
}

export { CustomError}