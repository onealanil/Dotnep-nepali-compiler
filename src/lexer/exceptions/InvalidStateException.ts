/**
 * @file InvalidStateException.ts
 * @description This file defines the InvalidStateException class, which is used to indicate that a lexer is in an invalid state.
 * It extends the built-in Error class and provides a custom error message.
 * @module InvalidStateException
 */
export class InvalidStateException extends Error{
    constructor(message: string){
        super(message);
        this.name = "InvalidStateException";
    }
}