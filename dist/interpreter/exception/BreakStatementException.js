"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BreakStatementException = void 0;
class BreakStatementException extends Error {
    constructor(message) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
        this.name = BreakStatementException.name;
    }
}
exports.BreakStatementException = BreakStatementException;
