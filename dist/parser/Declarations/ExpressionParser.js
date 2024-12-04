"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseBinaryExpression = void 0;
const ast_1 = require("../AST/ast");
const TokenType_1 = require("../../lexer/token_type/TokenType");
function parseBinaryExpression(tokens, cursor) {
    let leftNode;
    function parsePrimary() {
        const token = tokens[cursor];
        if (token.type === TokenType_1.TokenType.NUMBER) {
            cursor++;
            return {
                node: {
                    type: ast_1.ASTNodeType.NumericLiteral,
                    value: Number(token.value)
                },
                cursor
            };
        }
        else if (token.type === TokenType_1.TokenType.IDENTIFIER) {
            cursor++;
            return {
                node: {
                    type: ast_1.ASTNodeType.Identifier,
                    name: token.value
                },
                cursor
            };
        }
        else if (token.type === TokenType_1.TokenType.STRING) {
            cursor++;
            return {
                node: {
                    type: ast_1.ASTNodeType.String,
                    value: token.value
                },
                cursor
            };
        }
        else if (token.type === TokenType_1.TokenType.BOOLEAN) {
            cursor++;
            return {
                node: {
                    type: ast_1.ASTNodeType.BooleanLiteral,
                    value: token.value === "sahi"
                },
                cursor
            };
        }
        else if (token.type === TokenType_1.TokenType.LeftParen) {
            cursor++;
            const expression = parseBinaryExpression(tokens, cursor);
            if (tokens[expression.cursor].type === TokenType_1.TokenType.RightParen) {
                cursor = expression.cursor + 1;
                return {
                    node: expression.node,
                    cursor
                };
            }
            else {
                throw new Error(`Closing parenthesis, expect gareko thiyo tara ${tokens[expression.cursor].value}, yo bhetiyo`);
            }
        }
        else {
            throw new Error(`Unexpected token: ${token.type}`);
        }
    }
    ({ node: leftNode, cursor } = parsePrimary());
    while (cursor < tokens.length && (tokens[cursor].type === TokenType_1.TokenType.OPERATOR && ["+", "-", "*", "/", "%", "<", ">", "<=", ">=", "==", "!="].includes(tokens[cursor].value))) {
        const operator = tokens[cursor].value;
        cursor++;
        let rightNode;
        ({ node: rightNode, cursor } = parsePrimary());
        leftNode = {
            type: ast_1.ASTNodeType.BinaryExpression,
            left: leftNode,
            operator: operator,
            right: rightNode
        };
    }
    return { node: leftNode, cursor };
}
exports.parseBinaryExpression = parseBinaryExpression;
