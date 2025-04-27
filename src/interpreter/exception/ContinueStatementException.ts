/**
 * @file ContinueStatementException.ts
 * @description This file contains the ContinueStatementException class for handling continue statement errors in the interpreter.
 * @includes ContinueStatementException
 * @exports ContinueStatementException
 */
export class ContinueStatementException extends Error {
    constructor(message?: string) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype); 
        this.name = ContinueStatementException.name; 
    }
}
