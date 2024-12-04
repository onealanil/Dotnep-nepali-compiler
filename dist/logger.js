"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.log = exports.setLogger = void 0;
let logFunction = () => { };
function setLogger(newLogFunction) {
    logFunction = newLogFunction;
}
exports.setLogger = setLogger;
function log(message, data) {
    logFunction(message, data);
}
exports.log = log;
