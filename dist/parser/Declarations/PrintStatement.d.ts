import { Token } from "../../lexer/token_type/Token";
import { PrintNode } from "../AST/ast";
import { variableInfo } from "../helper/Interfaces";
export declare function parsePrintStatement(tokens: Token[], cursor: number, declaredVariables: Map<string, variableInfo>, reportError: (message: string) => void): {
    printNode: PrintNode;
    cursor: number;
};
