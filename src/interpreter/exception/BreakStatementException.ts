/**
 * @file BreakStatementException.ts
 * @description This file contains the BreakStatementException class for handling break statement errors in the interpreter.
 * @includes BreakStatementException
 * @exports BreakStatementException
 */
export class BreakStatementException extends Error {
    constructor(message?: string) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype); 
        this.name = BreakStatementException.name;
    }
}
