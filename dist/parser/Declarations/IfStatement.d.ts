import { Token } from "../../lexer/token_type/Token";
import { IfStatementNode } from "../AST/ast";
import { variableInfo } from "../helper/Interfaces";
export declare function parseIfStatement(tokens: Token[], cursor: number, declaredVariables: Map<string, variableInfo>, reportError: (message: string) => void): {
    ifStatement: IfStatementNode;
    cursor: number;
};
