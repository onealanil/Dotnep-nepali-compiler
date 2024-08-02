"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGlobalScope = exports.Scope = void 0;
class Scope {
    constructor(parentScope = null) {
        this.variables = new Map();
        this.parentScope = parentScope;
    }
    declare(name, value) {
        if (this.variables.has(name)) {
            throw new Error(`Variable "${name}" is already declared in this scope.`);
        }
        this.variables.set(name, value);
    }
    assign(name, value) {
        if (this.variables.has(name)) {
            this.variables.set(name, value);
        }
        else if (this.parentScope) {
            this.parentScope.assign(name, value);
        }
        else {
            throw new Error(`Cannot assign to undeclared variable "${name}".`);
        }
    }
    lookup(name) {
        if (this.variables.has(name)) {
            return this.variables.get(name);
        }
        else if (this.parentScope) {
            return this.parentScope.lookup(name);
        }
        else {
            throw new Error(`Variable "${name}" is not defined.`);
        }
    }
    child() {
        return new Scope(this);
    }
}
exports.Scope = Scope;
function createGlobalScope() {
    return new Scope();
}
exports.createGlobalScope = createGlobalScope;
