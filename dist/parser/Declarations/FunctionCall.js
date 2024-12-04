"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseFunctionCall = void 0;
const ast_1 = require("../AST/ast");
const CustomErrors_1 = require("../errors/CustomErrors");
const ExpressionParser_1 = require("./ExpressionParser");
function parseFunctionCall(tokens, cursor, reportError) {
    const nameToken = tokens[cursor];
    if (nameToken.type !== "IDENTIFIER") {
        reportError(`Function name expect gareko thiyo,  at position ${cursor}`);
        throw new CustomErrors_1.CustomError(`Function name expect gareko thiyo, at position ${cursor}`);
    }
    const callee = {
        type: ast_1.ASTNodeType.Identifier,
        name: nameToken.value
    };
    cursor++;
    if (tokens[cursor].type !== "LeftParen") {
        reportError(`'(' expect gareko thiyo, function name pachhi, at position ${cursor}`);
        throw new CustomErrors_1.CustomError(`'(' expect gareko thiyo, function name pachhi, at position ${cursor}`);
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
            reportError(`',' athaba ')' expect gareko thiyo, at position ${cursor}.`);
            throw new CustomErrors_1.CustomError(` ',' athaba ')' expect gareko thiyo, at position ${cursor}.`);
        }
    }
    if (tokens[cursor].type !== "RightParen") {
        reportError(`')' expect gareko thiyo tara ${tokens[cursor].value} yo bhetiyo.`);
        throw new CustomErrors_1.CustomError(`')' expect gareko thiyo tara ${tokens[cursor].value} yo bhetiyo.`);
    }
    cursor++;
    if (tokens[cursor].type !== "SEMICOLON") {
        reportError(`';' expect gareko thiyo, function call pachhi at position ${cursor}`);
        throw new CustomErrors_1.CustomError(`';' expect garko thiyo, function call pachhi at position ${cursor}`);
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
