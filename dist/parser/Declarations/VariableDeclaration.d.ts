import { Token } from "../../lexer/token_type/Token";
import { VariableDeclarationNode } from "../AST/ast";
import { variableInfo } from "../helper/Interfaces";
export declare function parseVariableDeclaration(tokens: Token[], cursor: number, declaredVariables: Map<string, variableInfo>, reportError: (message: string) => void): {
    declaration: VariableDeclarationNode;
    cursor: number;
};
