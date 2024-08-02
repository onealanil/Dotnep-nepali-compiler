import { Token } from "../../lexer/token_type/Token";
import { ProgramNode } from "../AST/ast";
export declare class Parsing {
    private _tokens;
    private _cursor;
    private _errors;
    private _declaredVariables;
    constructor();
    reset(): void;
    initializeParsing(tokens: Token[]): void;
    producedAST(): ProgramNode;
    resetDeclaredVariables(): void;
    isAtEnd(): boolean;
    private advance;
    private peek;
    private reportError;
}
