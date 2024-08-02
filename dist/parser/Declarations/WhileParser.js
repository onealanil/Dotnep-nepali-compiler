"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseWhileStatement = void 0;
const ast_1 = require("../AST/ast");
const CustomErrors_1 = require("../errors/CustomErrors");
const VariableDeclaration_1 = require("./VariableDeclaration");
const PrintStatement_1 = require("./PrintStatement");
const AssignmentOperator_1 = require("./AssignmentOperator");
const IfStatement_1 = require("./IfStatement");
const ExpressionParser_1 = require("./ExpressionParser");
function parseWhileStatement(tokens, cursor, declaredVariables, reportError) {
    let current = cursor;
    if (tokens[current].type !== "WHILE" || tokens[current].value !== "jaba samma") {
        reportError(`Expected 'jaba samma' but found ${tokens[current].value}`);
        throw new CustomErrors_1.CustomError(`Parsing failed: Expected 'jaba samma' but found ${tokens[current].value}`);
    }
    current++;
    // Check for '('
    if (tokens[current].type !== "LeftParen") {
        reportError(`Expected '(' but found ${tokens[current].value}`);
        throw new CustomErrors_1.CustomError(`Parsing failed: Expected '(' but found ${tokens[current].value}`);
    }
    current++; // Move past '('
    // Parse the condition expression
    let condition;
    if (tokens[current].type === "BOOLEAN") {
        condition = {
            node: {
                type: ast_1.ASTNodeType.BooleanLiteral,
                value: tokens[current].value === "sahi"
            },
            cursor: current + 1
        };
    }
    else {
        condition = (0, ExpressionParser_1.parseBinaryExpression)(tokens, current);
    }
    current = condition.cursor;
    // // Parse the condition expression
    // const condition = parseBinaryExpression(tokens, current);
    // current = condition.cursor;
    // Check for ')'
    if (tokens[current].type !== "RightParen") {
        reportError(`Expected ')' but found ${tokens[current].value}`);
        throw new CustomErrors_1.CustomError(`Parsing failed: Expected ')' but found ${tokens[current].value}`);
    }
    current++; // Move past ')'
    // Parse the body of the while loop
    const body = parseWhileLoopBody(tokens, current, declaredVariables, reportError);
    current = body.cursor;
    // Create the WhileStatementNode
    const whileStatement = {
        type: ast_1.ASTNodeType.WhileStatement,
        test: condition.node,
        body: body.blockStatement,
    };
    return { whileStatement, cursor: current };
}
exports.parseWhileStatement = parseWhileStatement;
function parseWhileLoopBody(tokens, cursor, declaredVariables, reportError) {
    let current = cursor;
    const blockBody = [];
    // Check for '{'
    if (tokens[current].type !== "LeftBrace") {
        reportError(`Expected '{' but found ${tokens[current].value}`);
        throw new CustomErrors_1.CustomError(`Parsing failed: Expected '{' but found ${tokens[current].value}`);
    }
    current++; // Move past '{'
    while (tokens[current].type !== "RightBrace" && current < tokens.length) {
        const token = tokens[current];
        switch (token.type) {
            case "KEYWORD": {
                if (token.value === "rakh") {
                    const { declaration, cursor: newCursor } = (0, VariableDeclaration_1.parseVariableDeclaration)(tokens, current, declaredVariables, reportError);
                    blockBody.push(declaration);
                    current = newCursor;
                }
                else {
                    reportError(`Unexpected keyword '${token.value}' at position ${current}`);
                    throw new CustomErrors_1.CustomError(`Parsing failed: Unexpected keyword '${token.value}' at position ${current}`);
                }
                break;
            }
            case "PRINT": {
                if (token.value === "nikaal") {
                    const { printNode, cursor: newCursor } = (0, PrintStatement_1.parsePrintStatement)(tokens, current, declaredVariables, reportError);
                    blockBody.push(printNode);
                    current = newCursor;
                }
                else {
                    reportError(`Unexpected keyword '${token.value}' at position ${current}`);
                    throw new CustomErrors_1.CustomError(`Parsing failed: Unexpected keyword '${token.value}' at position ${current}`);
                }
                break;
            }
            case "IDENTIFIER": {
                const nextToken = tokens[current + 1];
                if (nextToken && nextToken.type === "OPERATOR") {
                    const { assignment, cursor: newCursor } = (0, AssignmentOperator_1.parseAssignmentStatement)(tokens, current, declaredVariables, reportError);
                    if (assignment) {
                        blockBody.push(assignment);
                    }
                    current = newCursor;
                }
                else {
                    reportError(`Unexpected identifier '${token.value}' at position ${current}`);
                    throw new CustomErrors_1.CustomError(`Parsing failed: Unexpected identifier '${token.value}' at position ${current}`);
                }
                break;
            }
            case "IF": {
                const { ifStatement, cursor: newCursor1 } = (0, IfStatement_1.parseIfStatement)(tokens, current, declaredVariables, reportError);
                blockBody.push(ifStatement);
                current = newCursor1;
                break;
            }
            case "WHILE": {
                const { whileStatement, cursor: newCursor2 } = parseWhileStatement(tokens, current, declaredVariables, reportError);
                blockBody.push(whileStatement);
                current = newCursor2;
                break;
            }
            case "BREAK": {
                if (token.value === "bhayo") {
                    const breakNode = {
                        type: ast_1.ASTNodeType.BreakStatement,
                    };
                    blockBody.push(breakNode);
                    current++; // Move past 'bhayo'
                }
                else {
                    reportError(`Unexpected keyword '${token.value}' at position ${current}`);
                    throw new CustomErrors_1.CustomError(`Parsing failed: Unexpected keyword '${token.value}' at position ${current}`);
                }
                break;
            }
            case "CONTINUE": {
                if (token.value === "jaari rakh") {
                    const continueNode = {
                        type: ast_1.ASTNodeType.ContinueStatement,
                    };
                    blockBody.push(continueNode);
                    current++; // Move past 'jaari rakh'
                }
                else {
                    reportError(`Unexpected keyword '${token.value}' at position ${current}`);
                    throw new CustomErrors_1.CustomError(`Parsing failed: Unexpected keyword '${token.value}' at position ${current}`);
                }
                break;
            }
            default: {
                reportError(`Unexpected token '${token.value}' at position ${current}`);
                throw new CustomErrors_1.CustomError(`Parsing failed: Unexpected token '${token.value}' at position ${current}`);
            }
        }
        if (tokens[current].type === "SEMICOLON") {
            current++;
        }
    }
    // Check for '}'
    if (tokens[current].type !== "RightBrace") {
        reportError(`Expected '}' but found ${tokens[current].value}`);
        throw new CustomErrors_1.CustomError(`Parsing failed: Expected '}' but found ${tokens[current].value}`);
    }
    current++; // Move past '}'
    const blockStatement = {
        type: ast_1.ASTNodeType.BlockStatement,
        body: blockBody,
    };
    return { blockStatement, cursor: current };
}