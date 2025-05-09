"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseReturnStatement = exports.parseFunctionDeclaration = void 0;
const ast_1 = require("../AST/ast");
const CustomErrors_1 = require("../errors/CustomErrors");
const AssignmentOperator_1 = require("./AssignmentOperator");
const ExpressionParser_1 = require("./ExpressionParser");
const FunctionCall_1 = require("./FunctionCall");
const IfStatement_1 = require("./IfStatement");
const PrintStatement_1 = require("./PrintStatement");
const VariableDeclaration_1 = require("./VariableDeclaration");
const WhileParser_1 = require("./WhileParser");
const globalVariables = new Map();
function parseFunctionDeclaration(tokens, cursor, reportError, declaredVariables) {
    let returns = false;
    if (tokens[cursor].type === "FUNCTION" && tokens[cursor].value === "kaam ra firta") {
        returns = true;
    }
    else if (tokens[cursor].type === "FUNCTION" && tokens[cursor].value === "kaam") {
        returns = false;
    }
    else {
        reportError(`'kaam ra firta' or 'kaam' expect gareko thiyo, at position ${cursor}`);
        throw new CustomErrors_1.CustomError(`'kaam ra firta' or 'kaam' expect gareko thiyo, at position ${cursor}`);
    }
    cursor++;
    const nameToken = tokens[cursor];
    if (nameToken.type !== "IDENTIFIER") {
        reportError(`Function name expect gareko thiyo, at position ${cursor}`);
        throw new CustomErrors_1.CustomError(`Function name expect gareko thiyo, at position ${cursor}`);
    }
    const name = {
        type: ast_1.ASTNodeType.Identifier,
        name: nameToken.value
    };
    cursor++;
    if (tokens[cursor].type !== "LeftParen") {
        reportError(`'(' expect gareko thiyo, function name pachhi at position ${cursor}`);
        throw new CustomErrors_1.CustomError(`'(' expect gareko thiyo, function name pachhi at position ${cursor}`);
    }
    cursor++;
    const params = [];
    while (tokens[cursor].type !== "RightParen") {
        if (tokens[cursor].type !== "IDENTIFIER") {
            reportError(`Parameter name expect gareko thiyo, at position ${cursor}`);
            throw new CustomErrors_1.CustomError(`Parameter name expect gareko thiyo, at position ${cursor}`);
        }
        params.push({
            type: ast_1.ASTNodeType.Identifier,
            name: tokens[cursor].value
        });
        declaredVariables.set(tokens[cursor].value, {
            type: "string",
            value: null,
            scope: "local"
        });
        cursor++;
        if (tokens[cursor].type === "COMMA") {
            cursor++;
        }
        else if (tokens[cursor].type !== "RightParen") {
            reportError(`',' athaba ')' expect gareko thiyo at position ${cursor}`);
            throw new CustomErrors_1.CustomError(` ',' athaba ')' gareko thiyo at position ${cursor}`);
        }
    }
    cursor++;
    if (tokens[cursor].type !== "LeftBrace") {
        reportError(`'{' expect gareko thiyo function parameters pacchi, at position ${cursor}`);
        throw new CustomErrors_1.CustomError(`'{' expect gareko thiyo function parameters pachhi, at position ${cursor}`);
    }
    cursor++;
    const bodyResult = parseBlockStatement(tokens, cursor, reportError, declaredVariables);
    cursor = bodyResult.cursor;
    if (returns) {
        let hasReturnStatement = false;
        for (const statement of bodyResult.block.body) {
            if (statement.type === ast_1.ASTNodeType.ReturnStatement) {
                hasReturnStatement = true;
                break;
            }
        }
        if (!hasReturnStatement) {
            reportError(`Function '${name.name}' requires 'kaam ra firta' declaration tara 'firta' statement ko kami bhayo.`);
            throw new CustomErrors_1.CustomError(`Function '${name.name}' requires 'kaam ra firta' declaration tara 'firta' statement ko kami bhayo.`);
        }
    }
    else {
        for (const statement of bodyResult.block.body) {
            if (statement.type === ast_1.ASTNodeType.ReturnStatement) {
                reportError(`Function '${name.name}' is declared with 'kaam' teibhayera 'firta' statement ko jarurat chhaina.`);
                throw new CustomErrors_1.CustomError(`Function '${name.name}' is declared with 'kaam' teibhayera 'firta' statement ko jarurat chhaina.`);
            }
        }
    }
    const functionDeclaration = {
        type: ast_1.ASTNodeType.FunctionDeclaration,
        name,
        params,
        body: bodyResult.block,
        returns
    };
    return { declaration: functionDeclaration, cursor };
}
exports.parseFunctionDeclaration = parseFunctionDeclaration;
function parseReturnStatement(tokens, cursor, reportError) {
    const returnToken = tokens[cursor];
    if (returnToken.type !== "RETURN" || returnToken.value !== "firta") {
        reportError(`'firta' expect gareko thiyo, at position ${cursor}`);
        throw new CustomErrors_1.CustomError(`'firta' expect gareko thiyo, at position ${cursor}`);
    }
    cursor++;
    const result = (0, ExpressionParser_1.parseBinaryExpression)(tokens, cursor);
    cursor = result.cursor;
    const returnStatement = {
        type: ast_1.ASTNodeType.ReturnStatement,
        argument: result.node
    };
    if (tokens[cursor].type !== "SEMICOLON") {
        reportError(`';' expect garko thiyo 'firta' pachhi, tara '${tokens[cursor].value}' vetiyo.`);
        throw new CustomErrors_1.CustomError(`';' expect gareko thiyo 'firta' pachhi, tara '${tokens[cursor].value}' vetiyo.`);
    }
    cursor++;
    return { statement: returnStatement, cursor };
}
exports.parseReturnStatement = parseReturnStatement;
function parseBlockStatement(tokens, cursor, reportError, declaredVariables) {
    const block = {
        type: ast_1.ASTNodeType.BlockStatement,
        body: []
    };
    while (tokens[cursor].type !== "RightBrace") {
        const result = parseStatement(tokens, cursor, declaredVariables, reportError);
        block.body.push(result.statement);
        cursor = result.cursor;
    }
    cursor++;
    return { block, cursor };
}
function parseStatement(tokens, cursor, declaredVariables, reportError) {
    var _a;
    const token = tokens[cursor];
    if (token.type === "IDENTIFIER") {
        if (((_a = tokens[cursor + 1]) === null || _a === void 0 ? void 0 : _a.type) === "LeftParen") {
            const result = (0, FunctionCall_1.parseFunctionCall)(tokens, cursor, reportError);
            return { statement: result.call, cursor: result.cursor };
        }
        else {
            const identifier = token.value;
            const isInFunctionScope = declaredVariables.has(identifier);
            const isInGlobalScope = globalVariables.has(identifier);
            if (isInFunctionScope) {
                const result = (0, AssignmentOperator_1.parseAssignmentStatement)(tokens, cursor, declaredVariables, reportError);
                return { statement: result.assignment, cursor: result.cursor };
            }
            else if (isInGlobalScope) {
                const result = parseGlobalVariable(tokens, cursor, globalVariables, reportError);
                return { statement: result.variable, cursor: result.cursor };
            }
            else {
                reportError(`Variable '${identifier}' declared gareko chhaina.`);
                throw new CustomErrors_1.CustomError(`Variable '${identifier}' declared gareko chhaina.`);
            }
        }
    }
    else if (token.type === "KEYWORD" && token.value === "rakh") {
        const result = (0, VariableDeclaration_1.parseVariableDeclaration)(tokens, cursor, declaredVariables, reportError);
        return { statement: result.declaration, cursor: result.cursor };
    }
    else if (token.type === "PRINT" && token.value === "nikaal") {
        const result = (0, PrintStatement_1.parsePrintStatement)(tokens, cursor, declaredVariables, reportError);
        return { statement: result.printNode, cursor: result.cursor };
    }
    else if (token.type === "IF" && token.value === "yedi") {
        const result = (0, IfStatement_1.parseIfStatement)(tokens, cursor, declaredVariables, reportError);
        return { statement: result.ifStatement, cursor: result.cursor };
    }
    else if (token.type === "WHILE" && token.value === "jaba samma") {
        const result = (0, WhileParser_1.parseWhileStatement)(tokens, cursor, declaredVariables, reportError);
        return { statement: result.whileStatement, cursor: result.cursor };
    }
    else if (token.type === "RETURN" && token.value === "firta") {
        const result = parseReturnStatement(tokens, cursor, reportError);
        return { statement: result.statement, cursor: result.cursor };
    }
    else if (token.type === "SEMICOLON") {
        cursor++;
        return { statement: null, cursor };
    }
    throw new CustomErrors_1.CustomError(`Unexpected statement type: ${token.type} at position ${cursor}`);
}
function parseGlobalVariable(tokens, cursor, globalVariables, reportError) {
    const variableName = tokens[cursor].value;
    if (globalVariables.has(variableName)) {
        reportError(`Variable '${variableName}' agaadinai global variable ma declared garisakeko chha.`);
        throw new CustomErrors_1.CustomError(`Variable '${variableName}' agaadinai global variable ma declared garisakeko chha.`);
    }
    const result = (0, VariableDeclaration_1.parseVariableDeclaration)(tokens, cursor, globalVariables, reportError);
    return { variable: result.declaration, cursor: result.cursor };
}
