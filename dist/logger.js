"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.log = exports.setLogger = void 0;
let logFunction = () => { }; // Default to no-op
function setLogger(newLogFunction) {
    logFunction = newLogFunction;
}
exports.setLogger = setLogger;
function log(message, data) {
    logFunction(message, data);
}
exports.log = log;
// Use this log function throughout your compiler code
