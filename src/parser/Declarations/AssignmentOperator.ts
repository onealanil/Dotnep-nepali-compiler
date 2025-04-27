/**
 * @file AssignmentOperator.ts
 * @description This file contains the function to parse assignment statements in the language.
 * @includes parseAssignmentStatement, parseExpression, parsePrimary
 * @exports parseAssignmentStatement
 */
import { Token } from "../../lexer/token_type/Token";
import { ASTNode, ASTNodeType, IdentifierNode, AssignmentNode, NumericLiteralNode, IncrementNode } from "../AST/ast";
import { variableInfo } from "../helper/Interfaces";

/**
 * @function parseAssignmentStatement
 * @description Parses an assignment statement or increment statement from the list of tokens.
 * @param tokens - The list of tokens to be parsed.
 * @param cursor - The current position in the list of tokens.
 * @param declaredVariables - A map of declared variables for scope resolution.
 * @param reportError - A function to report errors during parsing.
 * @returns An object containing the parsed assignment or increment node and the updated cursor position.
 */
export function parseAssignmentStatement(
    tokens: Token[],
    cursor: number,
    declaredVariables: Map<string, variableInfo>,
    reportError: (message: string) => void
): { assignment: AssignmentNode | IncrementNode; cursor: number } {
    let _cursor = cursor;
    const advance = () => tokens[_cursor++];
    const peek = () => tokens[_cursor];

    const identifierToken = advance();
    if (identifierToken.type !== "IDENTIFIER") {
        reportError(`Identifier expect gareko thiyo assignment ma tara, ${identifierToken.type} yo bhetiyo`);
    }

    const identifier: IdentifierNode = {
        type: ASTNodeType.Identifier,
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
        } else {
            reportError(`';' yo expect gareko thiyo tara ${peek().type} yo bhetiyo`);
        }

        const assignment: AssignmentNode = {
            type: ASTNodeType.Assignment,
            identifier,
            value,
        };
        const varInfo = declaredVariables.get(identifier.name);
        if (varInfo) {
            varInfo.value = value;
        }

        return { assignment, cursor: _cursor };
    } else if (peek().type === "OPERATOR" && peek().value === "++") {
        advance(); // skip '++'

        if (peek().type === "SEMICOLON") {
            advance(); // skip ';'
        } else {
            reportError(`';' expect gareko thiyo tara ${peek().type} yo bhetiyo`);
        }

        const increment: IncrementNode = {
            type: ASTNodeType.Increment,
            identifier,
        };
        const varInfo = declaredVariables.get(identifier.name);
        if (varInfo && varInfo.value && varInfo.value.type === ASTNodeType.NumericLiteral) {
            varInfo.value = { type: ASTNodeType.NumericLiteral, value: (varInfo.value as NumericLiteralNode).value + 1 };
        }

        return { assignment: increment, cursor: _cursor };
    } else {
        reportError(`'=' athaba'++' expect gareko thiyo assignment ma tara ${peek().type} yo bhetiyo`);
    }

    const assignment: AssignmentNode = {
        type: ASTNodeType.Assignment,
        identifier,
        value: {
            type: ASTNodeType.NumericLiteral,
            value: 0
        }
    };

    return { assignment, cursor: _cursor };
}

/**
 * @function parseExpression
 * @param tokens - The list of tokens to be parsed.
 * @param cursor - The current position in the list of tokens.
 * @param declaredVariables - A map of declared variables for scope resolution.
 * @param reportError - A function to report errors during parsing.
 * @description Parses an expression from the list of tokens.
 * @throws {Error} - If an unexpected token is encountered.
 * @returns {Object} - An object containing the parsed node and the updated cursor position.
 */
function parseExpression(tokens: Token[], cursor: number, declaredVariables: Map<string, variableInfo>, reportError: (message: string) => void): { node: ASTNode, cursor: number } {
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
                type: ASTNodeType.BinaryExpression,
                left: left.node,
                operator,
                right: right.node
            },
            cursor: _cursor
        };
    }

    return left;
}

/**
 * @function parsePrimary
 * @param tokens - The list of tokens to be parsed.
 * @param cursor - The current position in the list of tokens.
 * @param declaredVariables - A map of declared variables for scope resolution.
 * @param reportError - A function to report errors during parsing.
 * @returns {Object} - An object containing the parsed node and the updated cursor position.
 * @description Parses a primary expression from the list of tokens.
 * @throws {Error} - If an unexpected token is encountered.
 */
function parsePrimary(tokens: Token[], cursor: number, declaredVariables: Map<string, variableInfo>, reportError: (message: string) => void): { node: ASTNode, cursor: number } {
    const token = tokens[cursor++];

    if (token.type === "NUMBER") {
        return {
            node: {
                type: ASTNodeType.NumericLiteral,
                value: Number(token.value.trim())
            },
            cursor
        };
    }

    if (token.type === "STRING") {
        return {
            node: {
                type: ASTNodeType.String,
                value: token.value.trim()
            },
            cursor
        };
    }

    if (token.type === "IDENTIFIER") {
        return {
            node: {
                type: ASTNodeType.Identifier,
                name: token.value.trim()
            },
            cursor
        };
    }

    reportError(`Unexpected token bhetiyo: ${token.type}`);
    return { node: { type: ASTNodeType.NullType, value: null }, cursor };
}
