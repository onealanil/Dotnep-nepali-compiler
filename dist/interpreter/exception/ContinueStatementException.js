"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContinueStatementException = void 0;
class ContinueStatementException extends Error {
    constructor(message) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
        this.name = ContinueStatementException.name;
    }
}
exports.ContinueStatementException = ContinueStatementException;
