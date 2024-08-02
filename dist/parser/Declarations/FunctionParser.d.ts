import { Token } from "../../lexer/token_type/Token";
import { FunctionDeclarationNode } from "../AST/ast";
import { variableInfo as VariableInfo } from "../helper/Interfaces";
export declare function parseFunctionDeclaration(tokens: Token[], cursor: number, reportError: (message: string) => void, declaredVariables: Map<string, VariableInfo>): {
    declaration: FunctionDeclarationNode;
    cursor: number;
};
export declare function parseReturnStatement(tokens: Token[], cursor: number, reportError: (message: string) => void): {
    statement: any;
    cursor: number;
};
