"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReturnStatementException = void 0;
class ReturnStatementException extends Error {
    constructor(message) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
        this.name = ReturnStatementException.name;
    }
}
exports.ReturnStatementException = ReturnStatementException;
