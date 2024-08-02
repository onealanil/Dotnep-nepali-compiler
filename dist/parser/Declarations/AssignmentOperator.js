"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseAssignmentStatement = void 0;
const ast_1 = require("../AST/ast");
function parseAssignmentStatement(tokens, cursor, declaredVariables, reportError) {
    let _cursor = cursor;
    const advance = () => tokens[_cursor++];
    const peek = () => tokens[_cursor];
    const identifierToken = advance(); // variable name token
    if (identifierToken.type !== "IDENTIFIER") {
        reportError(`Identifier expected for assignment, but found ${identifierToken.type}`);
    }
    const identifier = {
        type: ast_1.ASTNodeType.Identifier,
        name: identifierToken.value,
    };
    if (!declaredVariables.has(identifier.name)) {
        reportError(`Variable ${identifier.name} undeclared`);
    }
    if (peek().type === "OPERATOR" && peek().value === "=") {
        advance(); // skip '='
        const result = parseExpression(tokens, _cursor, declaredVariables, reportError);
        const value = result.node;
        _cursor = result.cursor;
        if (peek().type === "SEMICOLON") {
            advance(); // skip ';'
        }
        else {
            reportError(`Expected ';' after assignment, but found ${peek().type}`);
        }
        const assignment = {
            type: ast_1.ASTNodeType.Assignment,
            identifier,
            value,
        };
        // Update the declared variables map
        const varInfo = declaredVariables.get(identifier.name);
        if (varInfo) {
            varInfo.value = value;
        }
        return { assignment, cursor: _cursor };
    }
    else if (peek().type === "OPERATOR" && peek().value === "++") {
        advance(); // skip '++'
        if (peek().type === "SEMICOLON") {
            advance(); // skip ';'
        }
        else {
            reportError(`Expected ';' after increment, but found ${peek().type}`);
        }
        const increment = {
            type: ast_1.ASTNodeType.Increment,
            identifier,
        };
        // Update the declared variables map for increment
        const varInfo = declaredVariables.get(identifier.name);
        if (varInfo && varInfo.value && varInfo.value.type === ast_1.ASTNodeType.NumericLiteral) {
            varInfo.value = { type: ast_1.ASTNodeType.NumericLiteral, value: varInfo.value.value + 1 };
        }
        return { assignment: increment, cursor: _cursor };
    }
    else {
        reportError(`Expected '=' or '++' in assignment, but found ${peek().type}`);
    }
    const assignment = {
        type: ast_1.ASTNodeType.Assignment,
        identifier,
        value: {
            type: ast_1.ASTNodeType.NumericLiteral,
            value: 0
        }
    };
    return { assignment, cursor: _cursor };
}
exports.parseAssignmentStatement = parseAssignmentStatement;
function parseExpression(tokens, cursor, declaredVariables, reportError) {
    let _cursor = cursor;
    const advance = () => tokens[_cursor++];
    const peek = () => tokens[_cursor];
    let left = parsePrimary(tokens, _cursor, declaredVariables, reportError);
    _cursor = left.cursor;
    while (peek() && peek().type === "OPERATOR" && ["+", "-", "*", "/", "%"].includes(peek().value)) {
        const operator = advance().value;
        const right = parsePrimary(tokens, _cursor, declaredVariables, reportError);
        _cursor = right.cursor;
        left = {
            node: {
                type: ast_1.ASTNodeType.BinaryExpression,
                left: left.node,
                operator,
                right: right.node
            },
            cursor: _cursor
        };
    }
    return left;
}
function parsePrimary(tokens, cursor, declaredVariables, reportError) {
    const token = tokens[cursor++];
    if (token.type === "NUMBER") {
        return {
            node: {
                type: ast_1.ASTNodeType.NumericLiteral,
                value: Number(token.value.trim())
            },
            cursor
        };
    }
    if (token.type === "STRING") {
        return {
            node: {
                type: ast_1.ASTNodeType.String,
                value: token.value.trim()
            },
            cursor
        };
    }
    if (token.type === "IDENTIFIER") {
        return {
            node: {
                type: ast_1.ASTNodeType.Identifier,
                name: token.value.trim()
            },
            cursor
        };
    }
    reportError(`Unexpected token in expression: ${token.type}`);
    return { node: { type: ast_1.ASTNodeType.NullType, value: null }, cursor };
}
