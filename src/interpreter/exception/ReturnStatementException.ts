/**
 * @file ReturnStatementException.ts
 * @description This file contains the ReturnStatementException class for handling return statement errors in the interpreter.
 * @includes ReturnStatementException
 * @exports ReturnStatementException
 */
export class ReturnStatementException extends Error {
    constructor(message?: string) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
        this.name = ReturnStatementException.name;
    }
}