import { Token } from "../../lexer/token_type/Token";
import { WhileStatementNode } from "../AST/ast";
import { variableInfo } from "../helper/Interfaces";
export declare function parseWhileStatement(tokens: Token[], cursor: number, declaredVariables: Map<string, variableInfo>, reportError: (message: string) => void): {
    whileStatement: WhileStatementNode;
    cursor: number;
};
