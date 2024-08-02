import { Token } from "../../lexer/token_type/Token";
import { ASTNode } from "../AST/ast";
export declare function parseBinaryExpression(tokens: Token[], cursor: number): {
    node: ASTNode;
    cursor: number;
};
