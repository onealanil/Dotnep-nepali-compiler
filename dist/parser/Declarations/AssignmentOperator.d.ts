import { Token } from "../../lexer/token_type/Token";
import { AssignmentNode, IncrementNode } from "../AST/ast";
import { variableInfo } from "../helper/Interfaces";
export declare function parseAssignmentStatement(tokens: Token[], cursor: number, declaredVariables: Map<string, variableInfo>, reportError: (message: string) => void): {
    assignment: AssignmentNode | IncrementNode;
    cursor: number;
};
