"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseFunctionCall = void 0;
const ast_1 = require("../AST/ast");
const CustomErrors_1 = require("../errors/CustomErrors");
const ExpressionParser_1 = require("./ExpressionParser");
function parseFunctionCall(tokens, cursor, reportError) {
    const nameToken = tokens[cursor];
    if (nameToken.type !== "IDENTIFIER") {
        reportError(`Expected function name at position ${cursor}`);
        throw new CustomErrors_1.CustomError(`Expected function name at position ${cursor}`);
    }
    const callee = {
        type: ast_1.ASTNodeType.Identifier,
        name: nameToken.value
    };
    cursor++;
    if (tokens[cursor].type !== "LeftParen") {
        reportError(`Expected '(' after function name at position ${cursor}`);
        throw new CustomErrors_1.CustomError(`Expected '(' after function name at position ${cursor}`);
    }
    cursor++;
    const args = [];
    while (tokens[cursor].type !== "RightParen" && tokens[cursor].type !== "EOF") {
        const result = parseExpression(tokens, cursor);
        args.push(result.expression);
        cursor = result.cursor;
        if (tokens[cursor].type === "COMMA") {
            cursor++;
        }
        else if (tokens[cursor].type !== "RightParen") {
            reportError(`Expected ',' or ')' at position ${cursor}`);
            throw new CustomErrors_1.CustomError(`Expected ',' or ')' at position ${cursor}`);
        }
    }
    if (tokens[cursor].type !== "RightParen") {
        reportError(`Expected ')' but found ${tokens[cursor].value}`);
        throw new CustomErrors_1.CustomError(`Expected ')' but found ${tokens[cursor].value}`);
    }
    cursor++;
    if (tokens[cursor].type !== "SEMICOLON") {
        reportError(`Expected ';' after function call at position ${cursor}`);
        throw new CustomErrors_1.CustomError(`Expected ';' after function call at position ${cursor}`);
    }
    cursor++;
    const functionCall = {
        type: ast_1.ASTNodeType.FunctionCall,
        callee,
        args
    };
    return { call: functionCall, cursor };
}
exports.parseFunctionCall = parseFunctionCall;
function parseExpression(tokens, cursor) {
    const result = (0, ExpressionParser_1.parseBinaryExpression)(tokens, cursor);
    return { expression: result.node, cursor: result.cursor };
}
