import { RuntimeVal } from "../interpreter/semanticAnalyzer/values";
export declare class Scope {
    private variables;
    private parentScope;
    constructor(parentScope?: Scope | null);
    declare(name: string, value: RuntimeVal): void;
    assign(name: string, value: RuntimeVal): void;
    lookup(name: string): RuntimeVal;
    child(): Scope;
}
export declare function createGlobalScope(): Scope;
