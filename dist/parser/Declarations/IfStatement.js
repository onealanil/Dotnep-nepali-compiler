"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseIfStatement = void 0;
const ast_1 = require("../AST/ast");
const CustomErrors_1 = require("../errors/CustomErrors");
const AssignmentOperator_1 = require("./AssignmentOperator");
const PrintStatement_1 = require("./PrintStatement");
const VariableDeclaration_1 = require("./VariableDeclaration");
function parseIfStatement(tokens, cursor, declaredVariables, reportError) {
    let _cursor = cursor;
    function advance() {
        return tokens[_cursor++];
    }
    function peek() {
        return tokens[_cursor];
    }
    function match(...types) {
        if (_cursor >= tokens.length)
            return false;
        return types.includes(peek().type);
    }
    function parseExpression(precedence = 0) {
        let left = parsePrimaryExpression();
        while (match("OPERATOR") && getPrecedence(peek().value) > precedence) {
            const operator = advance().value;
            const right = parseExpression(getPrecedence(operator));
            left = {
                type: ast_1.ASTNodeType.BinaryExpression,
                operator,
                left,
                right,
            };
        }
        return left;
    }
    function getPrecedence(operator) {
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
    function parsePrimaryExpression() {
        const token = peek();
        if (token.type === "NUMBER") {
            advance();
            return {
                type: ast_1.ASTNodeType.NumericLiteral,
                value: parseFloat(token.value),
            };
        }
        if (token.type === "BOOLEAN") {
            advance();
            return {
                type: ast_1.ASTNodeType.BooleanLiteral,
                value: token.value === "sahi",
            };
        }
        if (token.type === "STRING") {
            advance();
            return {
                type: ast_1.ASTNodeType.String,
                value: token.value,
            };
        }
        if (token.type === "IDENTIFIER") {
            advance();
            return {
                type: ast_1.ASTNodeType.Identifier,
                name: token.value,
            };
        }
        if (token.type === "LeftParen") {
            advance(); // Skip '('
            const expression = parseExpression();
            if (!match("RightParen")) {
                throw new CustomErrors_1.CustomError(`Expected ')' but found: ${peek().value}`);
            }
            advance(); // Skip ')'
            return expression;
        }
        throw new CustomErrors_1.CustomError(`Unexpected token: ${token.value}`);
    }
    function parseBlockStatement() {
        const body = [];
        while (!match("RightBrace") && _cursor < tokens.length) {
            const token = peek();
            if (token.type === "KEYWORD" && token.value === "rakh") {
                const result = (0, VariableDeclaration_1.parseVariableDeclaration)(tokens, _cursor, declaredVariables, reportError);
                _cursor = result.cursor;
                body.push(result.declaration);
            }
            else if (token.type === "PRINT" && token.value === "nikaal") {
                const result = (0, PrintStatement_1.parsePrintStatement)(tokens, _cursor, declaredVariables, reportError);
                _cursor = result.cursor;
                body.push(result.printNode);
            }
            else if (token.type === "IDENTIFIER") {
                const result = (0, AssignmentOperator_1.parseAssignmentStatement)(tokens, _cursor, declaredVariables, reportError);
                _cursor = result.cursor;
                if (result.assignment) {
                    body.push(result.assignment);
                }
            }
            else if (token.type === "IF" && token.value === "yedi") {
                const result = parseIfStatement(tokens, _cursor, declaredVariables, reportError);
                _cursor = result.cursor;
                body.push(result.ifStatement);
            }
            else if (token.type === "BREAK" && token.value === "bhayo") {
                const breakNode = {
                    type: ast_1.ASTNodeType.BreakStatement,
                };
                body.push(breakNode);
                _cursor++; // Move past 'bhayo'
                if (!match("SEMICOLON")) {
                    throw new CustomErrors_1.CustomError(`Expected ';' but found: ${peek().value}`);
                }
                _cursor++; // Move past ';'
            }
            else if (token.type === "CONTINUE" && token.value === "jaari rakh") {
                const continueNode = {
                    type: ast_1.ASTNodeType.ContinueStatement,
                };
                body.push(continueNode);
                _cursor++; // Move past 'jaari rakh'
                if (!match("SEMICOLON")) {
                    throw new CustomErrors_1.CustomError(`Expected ';' but found: ${peek().value}`);
                }
                _cursor++; // Move past ';'
            }
            else {
                console.log(`Unexpected token: ${token.value} (type: ${token.type}) at position ${_cursor}`);
                reportError(`Unexpected token: ${token.value} at position ${_cursor}`);
                advance();
            }
        }
        if (!match("RightBrace")) {
            throw new CustomErrors_1.CustomError(`Expected '}' but found: ${peek().value}`);
        }
        advance(); // Skip '}'
        return {
            type: ast_1.ASTNodeType.BlockStatement,
            body,
        };
    }
    advance(); // Skip 'yedi'
    if (!match("LeftParen")) {
        throw new CustomErrors_1.CustomError(`Expected '(' but found: ${peek().value}`);
    }
    advance(); // Skip '('
    const test = parseExpression(); // Parse the expression, including boolean literals and string comparisons
    if (!match("RightParen")) {
        throw new CustomErrors_1.CustomError(`Expected ')' but found: ${peek().value}`);
    }
    advance(); // Skip ')'
    if (!match("LeftBrace")) {
        throw new CustomErrors_1.CustomError(`Expected '{' but found: ${peek().value}`);
    }
    advance(); // Skip '{'
    const consequent = parseBlockStatement();
    let alternate;
    if (match("ELSEIF", "navaye")) {
        const elseIfStatements = [];
        while (match("ELSEIF", "navaye")) {
            advance(); // Skip 'navaye'
            if (!match("LeftParen")) {
                throw new CustomErrors_1.CustomError(`Expected '(' but found: ${peek().value}`);
            }
            advance(); // Skip '('
            const elseIfTest = parseExpression();
            if (!match("RightParen")) {
                throw new CustomErrors_1.CustomError(`Expected ')' but found: ${peek().value}`);
            }
            advance(); // Skip ')'
            if (!match("LeftBrace")) {
                throw new CustomErrors_1.CustomError(`Expected '{' but found: ${peek().value}`);
            }
            advance(); // Skip '{'
            const elseIfConsequent = parseBlockStatement();
            elseIfStatements.push({
                type: ast_1.ASTNodeType.IfStatement,
                test: elseIfTest,
                consequent: elseIfConsequent,
                alternate: undefined,
            });
        }
        if (match("ELSE", "haina bhane")) {
            advance(); // Skip 'haina bhane'
            if (!match("LeftBrace")) {
                throw new CustomErrors_1.CustomError(`Expected '{' but found: ${peek().value}`);
            }
            advance(); // Skip '{'
            const elseConsequent = parseBlockStatement();
            // Nest the else statement within the last else if statement
            let lastElseIf = elseIfStatements.pop();
            lastElseIf.alternate = elseConsequent;
            while (elseIfStatements.length > 0) {
                const nextElseIf = elseIfStatements.pop();
                nextElseIf.alternate = lastElseIf;
                lastElseIf = nextElseIf;
            }
            alternate = lastElseIf;
        }
        else {
            // Nest the else if statements
            let lastElseIf = elseIfStatements.pop();
            while (elseIfStatements.length > 0) {
                const nextElseIf = elseIfStatements.pop();
                nextElseIf.alternate = lastElseIf;
                lastElseIf = nextElseIf;
            }
            alternate = lastElseIf;
        }
    }
    else if (match("ELSE", "haina bhane")) {
        advance(); // Skip 'haina bhane'
        if (!match("LeftBrace")) {
            throw new CustomErrors_1.CustomError(`Expected '{' but found: ${peek().value}`);
        }
        advance(); // Skip '{'
        alternate = parseBlockStatement();
    }
    return {
        ifStatement: {
            type: ast_1.ASTNodeType.IfStatement,
            test: test,
            consequent,
            alternate,
        },
        cursor: _cursor,
    };
}
exports.parseIfStatement = parseIfStatement;
