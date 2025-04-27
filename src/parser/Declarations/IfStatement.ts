/**
 * @file IfStatement.ts
 * @description This file contains the function to parse if statements in the language.
 * @includes parseIfStatement
 * @exports parseIfStatement
 */
import { Token } from "../../lexer/token_type/Token";
import { ASTNodeType, IfStatementNode, BlockStatementNode, BinaryExpressionNode, NumericLiteralNode, BooleanLiteralNode, IdentifierNode, ASTNode, StringNode, BreakStatementNode, ContinueStatementNode } from "../AST/ast";
import { CustomError } from "../errors/CustomErrors";
import { variableInfo } from "../helper/Interfaces";
import { parseAssignmentStatement } from "./AssignmentOperator";
import { parsePrintStatement } from "./PrintStatement";
import { parseVariableDeclaration } from "./VariableDeclaration";

/**
 * @function parseIfStatement
 * @param tokens - The list of tokens to be parsed.
 * @param cursor - The current position in the list of tokens.
 * @param declaredVariables - A map of declared variables for scope resolution.
 * @param reportError - A function to report errors during parsing.
 * @description This function parses an if statement from the list of tokens.
 * It expects the if statement to start with 'yedi' followed by a condition in parentheses.
 * The body of the if statement is expected to be enclosed in braces '{ }'.
 * It also supports else if and else clauses.
 * If any of these conditions are not met, an error is reported.
 * @throws {CustomError} - If the syntax is incorrect or if expected tokens are not found.
 * @returns { ifStatement: IfStatementNode, cursor: number } - The parsed if statement and the updated cursor position.
 */
export function parseIfStatement(
    tokens: Token[],
    cursor: number,
    declaredVariables: Map<string, variableInfo>,
    reportError: (message: string) => void
): { ifStatement: IfStatementNode, cursor: number } {
    let _cursor = cursor;

    /**
     * @function advance
     * @description Advances the cursor to the next token.
     * @returns {Token} - The current token after advancing.
     */
    function advance(): Token {
        return tokens[_cursor++];
    }

    /**
     * @function peek
     * @description Returns the current token without advancing the cursor.
     * @returns {Token} - The current token.
     */
    function peek(): Token {
        return tokens[_cursor];
    }

    /**
     * @function match
     * @description Checks if the current token matches any of the specified types.
     * @param types - The types to check against.
     * @returns {boolean} - True if the current token matches any of the specified types, false otherwise.
     */
    function match(...types: string[]): boolean {
        if (_cursor >= tokens.length) return false;
        return types.includes(peek().type);
    }

    /**
     * @function parseExpression
     * @description Parses an expression based on operator precedence.
     * @param precedence - The precedence level for parsing.
     * @returns {ASTNode} - The parsed expression node.
     */
    function parseExpression(precedence = 0): ASTNode {
        let left = parsePrimaryExpression();

        while (match("OPERATOR") && getPrecedence(peek().value) > precedence) {
            const operator = advance().value;
            const right = parseExpression(getPrecedence(operator));
            left = {
                type: ASTNodeType.BinaryExpression,
                operator,
                left,
                right,
            } as BinaryExpressionNode;
        }

        return left;
    }

    /**
     * @function getPrecedence
     * @description Returns the precedence level of the given operator.
     * @param operator - The operator to check.
     * @returns {number} - The precedence level of the operator.
     */
    function getPrecedence(operator: string): number {
        switch (operator) {
            case "==":
            case "!=":
                return 1;
            case "<":
            case "<=":
            case ">":
            case ">=":
                return 2;
            case "+":
            case "-":
                return 3;
            case "*":
            case "/":
            case "%":
                return 4;
            default:
                return 0;
        }
    }

    /**
     * @function parsePrimaryExpression
     * @description Parses a primary expression (number, string, identifier, or parenthesized expression).
     * @returns {ASTNode} - The parsed primary expression node.
     */
    function parsePrimaryExpression(): ASTNode {
        const token = peek();

        if (token.type === "NUMBER") {
            advance();
            return {
                type: ASTNodeType.NumericLiteral,
                value: parseFloat(token.value),
            } as NumericLiteralNode;
        }

        if (token.type === "BOOLEAN") {
            advance();
            return {
                type: ASTNodeType.BooleanLiteral,
                value: token.value === "sahi",
            } as BooleanLiteralNode;
        }

        if (token.type === "STRING") {
            advance();
            return {
                type: ASTNodeType.String,
                value: token.value,
            } as StringNode;
        }

        if (token.type === "IDENTIFIER") {
            advance();
            return {
                type: ASTNodeType.Identifier,
                name: token.value,
            } as IdentifierNode;
        }

        if (token.type === "LeftParen") {
            advance(); // Skip '('
            const expression = parseExpression();
            if (!match("RightParen")) {
                throw new CustomError(`')' expect gareko thiyo tara: ${peek().value} yo bhetiyo.`);
            }
            advance(); // Skip ')'
            return expression;
        }

        throw new CustomError(`Unexpected token: ${token.value}`);
    }

    /**
     * @function parseBlockStatement
     * @description Parses a block statement enclosed in braces '{ }'.
     * @returns {BlockStatementNode} - The parsed block statement node.
     * @throws {CustomError} - If the syntax is incorrect or if expected tokens are not found.
     * @throws {Error} - If an unexpected token is encountered.
     */
    function parseBlockStatement(): BlockStatementNode {
        const body: ASTNode[] = [];

        while (!match("RightBrace") && _cursor < tokens.length) {
            const token = peek();

            if (token.type === "KEYWORD" && token.value === "rakh") {
                const result = parseVariableDeclaration(tokens, _cursor, declaredVariables, reportError);
                _cursor = result.cursor;
                body.push(result.declaration);
            } else if (token.type === "PRINT" && token.value === "nikaal") {
                const result = parsePrintStatement(tokens, _cursor, declaredVariables, reportError);
                _cursor = result.cursor;
                body.push(result.printNode);
            } else if (token.type === "IDENTIFIER") {
                const result = parseAssignmentStatement(tokens, _cursor, declaredVariables, reportError);
                _cursor = result.cursor;
                if (result.assignment) {
                    body.push(result.assignment);
                }
            } else if (token.type === "IF" && token.value === "yedi") {
                const result = parseIfStatement(tokens, _cursor, declaredVariables, reportError);
                _cursor = result.cursor;
                body.push(result.ifStatement);
            } else if (token.type === "BREAK" && token.value === "bhayo") {
                const breakNode: BreakStatementNode = {
                    type: ASTNodeType.BreakStatement,
                };
                body.push(breakNode);
                _cursor++; // Move past 'bhayo'
                if (!match("SEMICOLON")) {
                    throw new CustomError(`';' expect gareko thiyo tara: ${peek().value} yo bhetiyo.`);
                }
                _cursor++; // Move past ';'
            } else if (token.type === "CONTINUE" && token.value === "jaari rakh") {
                const continueNode: ContinueStatementNode = {
                    type: ASTNodeType.ContinueStatement,
                };
                body.push(continueNode);
                _cursor++; // Move past 'jaari rakh'
                if (!match("SEMICOLON")) {
                    throw new CustomError(`';' expect gareko thiyo tara: ${peek().value} yo bhetiyo.`);
                }
                _cursor++; // Move past ';'
            } else {
                console.log(`Unexpected token: ${token.value} (type: ${token.type}) at position ${_cursor}`);
                reportError(`Unexpected token: ${token.value} at position ${_cursor}`);
                advance();
            }
        }

        if (!match("RightBrace")) {
            throw new CustomError(`'}' expect gareko thiyo tara: ${peek().value} yo bhetiyo.`);
        }

        advance(); // Skip '}'

        return {
            type: ASTNodeType.BlockStatement,
            body,
        };
    }

    advance(); // Skip 'yedi'

    if (!match("LeftParen")) {
        throw new CustomError(`'(' expect gareko thiyo tara: ${peek().value} yo bhetiyo.`);
    }

    advance(); // Skip '('

    const test = parseExpression(); 
    if (!match("RightParen")) {
        throw new CustomError(`')' expect gareko thiyo tara: ${peek().value} yo bhetiyo.`);
    }

    advance(); // Skip ')'

    if (!match("LeftBrace")) {
        throw new CustomError(`'{' expect gareko thiyo tara: ${peek().value} yo bhetiyo.`);
    }

    advance(); // Skip '{'
    const consequent = parseBlockStatement();

    let alternate: IfStatementNode | BlockStatementNode | undefined;

    if (match("ELSEIF", "navaye")) {
        const elseIfStatements: IfStatementNode[] = [];
        while (match("ELSEIF", "navaye")) {
            advance(); // Skip 'navaye'

            if (!match("LeftParen")) {
                throw new CustomError(`'(' expect gareko thiyo tara: ${peek().value} yo bhetiyo.`);
            }

            advance(); // Skip '('
            const elseIfTest = parseExpression();

            if (!match("RightParen")) {
                throw new CustomError(`')' expect gareko thiyo tara: ${peek().value} yo bhetiyo.`);
            }

            advance(); // Skip ')'

            if (!match("LeftBrace")) {
                throw new CustomError(`'{' expect gareko thiyo tara: ${peek().value} yo bhetiyo.`);
            }

            advance(); // Skip '{'
            const elseIfConsequent = parseBlockStatement();

            elseIfStatements.push({
                type: ASTNodeType.IfStatement,
                test: elseIfTest as BinaryExpressionNode,
                consequent: elseIfConsequent,
                alternate: undefined,
            } as IfStatementNode);
        }

        if (match("ELSE", "haina bhane")) {
            advance(); // Skip 'haina bhane'

            if (!match("LeftBrace")) {
                throw new CustomError(`'{' expect gareko thiyo tara: ${peek().value} yo bhetiyo.`);
            }

            advance(); // Skip '{'
            const elseConsequent = parseBlockStatement();

            let lastElseIf = elseIfStatements.pop();
            lastElseIf!.alternate = elseConsequent;

            while (elseIfStatements.length > 0) {
                const nextElseIf = elseIfStatements.pop();
                nextElseIf!.alternate = lastElseIf;
                lastElseIf = nextElseIf;
            }

            alternate = lastElseIf;
        } else {
            // Nest the else if statements
            let lastElseIf = elseIfStatements.pop();

            while (elseIfStatements.length > 0) {
                const nextElseIf = elseIfStatements.pop();
                nextElseIf!.alternate = lastElseIf;
                lastElseIf = nextElseIf;
            }

            alternate = lastElseIf;
        }
    } else if (match("ELSE", "haina bhane")) {
        advance(); // Skip 'haina bhane'

        if (!match("LeftBrace")) {
            throw new CustomError(` '{' expect gareko thiyo tara: ${peek().value} yo bhetiyo.`);
        }

        advance(); // Skip '{'
        alternate = parseBlockStatement();
    }

    return {
        ifStatement: {
            type: ASTNodeType.IfStatement,
            test: test as BinaryExpressionNode,
            consequent,
            alternate,
        },
        cursor: _cursor,
    };
}
