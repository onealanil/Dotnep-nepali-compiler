import { ASTNode, ProgramNode } from "../../parser/AST/ast";
import { RuntimeVal } from "./values";
export declare class Environment {
    private parent;
    private variables;
    outputs: string[];
    constructor(parent?: Environment | null);
    define(name: string, value: RuntimeVal): void;
    assign(name: string, value: RuntimeVal): void;
    lookup(name: string): RuntimeVal;
    addOutput(output: string): void;
}
export declare function resetGlobalEnvironment(): void;
export declare function eval_program(program: ProgramNode): {
    results: RuntimeVal;
    outputs: any[];
};
export declare function evaluate(node: ASTNode, env: Environment): RuntimeVal;
