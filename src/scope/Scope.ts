/**
 * @file Scope.ts
 * @description This file contains the Scope class for managing variable scopes in the interpreter.
 * @includes Scope
 * @exports Scope, createGlobalScope
 * @requires RuntimeVal
 */
import { RuntimeVal } from "../interpreter/semanticAnalyzer/values";

/**
 * @class Scope
 * @description This class represents a scope for variable declarations and lookups.
 * It supports nested scopes, allowing for child scopes to inherit variables from parent scopes.
 */
export class Scope {
    private variables: Map<string, RuntimeVal> = new Map();
    private parentScope: Scope | null;

    constructor(parentScope: Scope | null = null) {
        this.parentScope = parentScope;
    }

    declare(name: string, value: RuntimeVal): void {
        if (this.variables.has(name)) {
            throw new Error(`Variable "${name}" agadi nai define gari sakeko chha!`);
        }
        this.variables.set(name, value);
    }

    assign(name: string, value: RuntimeVal): void {
        if (this.variables.has(name)) {
            this.variables.set(name, value);
        } else if (this.parentScope) {
            this.parentScope.assign(name, value);
        } else {
            throw new Error(`Undeclared variable assign garna mildaina, "${name}".`);
        }
    }

    lookup(name: string): RuntimeVal {
        if (this.variables.has(name)) {
            return this.variables.get(name)!;
        } else if (this.parentScope) {
            return this.parentScope.lookup(name);
        } else {
            throw new Error(`Variable "${name}" defined gareko chhaina.`);
        }
    }

    child(): Scope {
        return new Scope(this);
    }
}

export function createGlobalScope(): Scope {
    return new Scope();
}