/**
 * @file ExpressionParser.ts
 * @description This file contains the function to parse binary expressions in the language.
 * @includes parseBinaryExpression
 * @exports parseBinaryExpression
 */
import { Token } from "../../lexer/token_type/Token";
import { ASTNode, ASTNodeType, BinaryExpressionNode, NumericLiteralNode, IdentifierNode, StringNode, BooleanLiteralNode } from "../AST/ast";
import { TokenType } from "../../lexer/token_type/TokenType";

/**
 * @function parseBinaryExpression
 * @param tokens - The list of tokens to be parsed.
 * @param cursor - The current position in the token list.
 * @returns { node: ASTNode, cursor: number } - The parsed AST node and the updated cursor position.
 */
export function parseBinaryExpression(
    tokens: Token[],
    cursor: number
): { node: ASTNode, cursor: number } {
    let leftNode: ASTNode;

    function parsePrimary(): { node: ASTNode, cursor: number } {
        const token = tokens[cursor];

        if (token.type === TokenType.NUMBER) {
            cursor++;
            return {
                node: {
                    type: ASTNodeType.NumericLiteral,
                    value: Number(token.value)
                } as NumericLiteralNode,
                cursor
            };
        } else if (token.type === TokenType.IDENTIFIER) {
            cursor++;
            return {
                node: {
                    type: ASTNodeType.Identifier,
                    name: token.value
                } as IdentifierNode,
                cursor
            };
        }
        else if (token.type === TokenType.STRING) {
            cursor++;
            return {
                node: {
                    type: ASTNodeType.String,
                    value: token.value
                } as StringNode,
                cursor
            };
        }
        else if (token.type === TokenType.BOOLEAN) {
            cursor++;
            return {
                node: {
                    type: ASTNodeType.BooleanLiteral,
                    value: token.value === "sahi"
                } as BooleanLiteralNode,
                cursor
            };
        }

        else if (token.type === TokenType.LeftParen) {
            cursor++;
            const expression = parseBinaryExpression(tokens, cursor);
            if (tokens[expression.cursor].type === TokenType.RightParen) {
                cursor = expression.cursor + 1;
                return {
                    node: expression.node,
                    cursor
                };
            } else {
                throw new Error(`Closing parenthesis, expect gareko thiyo tara ${tokens[expression.cursor].value}, yo bhetiyo`);
            }
        } else {
            throw new Error(`Unexpected token: ${token.type}`);
        }
    }

    ({ node: leftNode, cursor } = parsePrimary());

    while (cursor < tokens.length && (tokens[cursor].type === TokenType.OPERATOR && ["+", "-", "*", "/", "%", "<", ">", "<=", ">=", "==", "!="].includes(tokens[cursor].value))) {
        const operator = tokens[cursor].value;
        cursor++;

        let rightNode: ASTNode;
        ({ node: rightNode, cursor } = parsePrimary());

        leftNode = {
            type: ASTNodeType.BinaryExpression,
            left: leftNode,
            operator: operator,
            right: rightNode
        } as BinaryExpressionNode;
    }

    return { node: leftNode, cursor };
}
