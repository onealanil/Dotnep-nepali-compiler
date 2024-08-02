"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidStateException = void 0;
class InvalidStateException extends Error {
    constructor(message) {
        super(message);
        this.name = "InvalidStateException";
    }
}
exports.InvalidStateException = InvalidStateException;
