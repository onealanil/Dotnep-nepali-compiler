"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parsing = void 0;
const ast_1 = require("../AST/ast");
const AssignmentOperator_1 = require("../Declarations/AssignmentOperator");
const IfStatement_1 = require("../Declarations/IfStatement");
const PrintStatement_1 = require("../Declarations/PrintStatement");
const VariableDeclaration_1 = require("../Declarations/VariableDeclaration");
const WhileParser_1 = require("../Declarations/WhileParser");
const FunctionParser_1 = require("../Declarations/FunctionParser");
const FunctionCall_1 = require("../Declarations/FunctionCall");
const CustomErrors_1 = require("../errors/CustomErrors");
const logger_1 = require("../../logger");
class Parsing {
    constructor() {
        this._tokens = [];
        this._cursor = 0;
        this._errors = [];
        this._declaredVariables = new Map();
        this._declaredVariables = new Map();
    }
    reset() {
        this._tokens = [];
        this._cursor = 0;
        this._errors = [];
        this._declaredVariables.clear();
        // Reset any other internal state here
    }
    // Initialize the parser with tokens
    initializeParsing(tokens) {
        this.reset();
        this._tokens = tokens;
        this._cursor = 0;
        this._errors = [];
        this._declaredVariables.clear();
        (0, logger_1.log)('Parser initialized', { tokensCount: tokens.length });
    }
    // Produce AST
    producedAST() {
        const program = {
            type: ast_1.ASTNodeType.Program,
            body: [],
        };
        while (!this.isAtEnd()) {
            const token = this.peek();
            if (token.type === "KEYWORD" && token.value === "rakh") {
                const result = (0, VariableDeclaration_1.parseVariableDeclaration)(this._tokens, this._cursor, this._declaredVariables, this.reportError.bind(this));
                this._cursor = result.cursor;
                program.body.push(result.declaration);
            }
            else if (token.type === "PRINT" && token.value === "nikaal") {
                const result = (0, PrintStatement_1.parsePrintStatement)(this._tokens, this._cursor, this._declaredVariables, this.reportError.bind(this));
                this._cursor = result.cursor;
                program.body.push(result.printNode);
            }
            else if (token.type === "IDENTIFIER") {
                const nextToken = this._tokens[this._cursor + 1];
                if (nextToken && nextToken.type === "LeftParen") {
                    const callResult = (0, FunctionCall_1.parseFunctionCall)(this._tokens, this._cursor, this.reportError.bind(this));
                    this._cursor = callResult.cursor;
                    program.body.push(callResult.call);
                }
                else {
                    const result = (0, AssignmentOperator_1.parseAssignmentStatement)(this._tokens, this._cursor, this._declaredVariables, this.reportError.bind(this));
                    this._cursor = result.cursor;
                    program.body.push(result.assignment);
                }
            }
            else if (token.type === "IF" && token.value === "yedi") {
                const result = (0, IfStatement_1.parseIfStatement)(this._tokens, this._cursor, this._declaredVariables, this.reportError.bind(this));
                this._cursor = result.cursor;
                program.body.push(result.ifStatement);
            }
            else if (token.type === "WHILE" && token.value === "jaba samma") {
                const result = (0, WhileParser_1.parseWhileStatement)(this._tokens, this._cursor, this._declaredVariables, this.reportError.bind(this));
                this._cursor = result.cursor;
                program.body.push(result.whileStatement);
            }
            else if ((token.type === "FUNCTION" && token.value === "kaam") ||
                (token.type === "FUNCTION" && token.value === "kaam ra firta")) {
                const result = (0, FunctionParser_1.parseFunctionDeclaration)(this._tokens, this._cursor, this.reportError.bind(this), this._declaredVariables);
                this._cursor = result.cursor;
                (0, logger_1.log)('AST production completed', { programBody: program.body });
                program.body.push(result.declaration);
            }
            else if (token.type === "EOF") {
                break;
            }
            else {
                this.reportError(`Unexpected token: ${token.value} at position ${this._cursor}`);
                this.advance();
            }
        }
        if (this._errors.length > 0) {
            const errorMessage = this._errors.join('\n');
            throw new CustomErrors_1.CustomError(`Parsing failed bhayo errors ko saathma:\n${errorMessage}`);
        }
        return program;
    }
    resetDeclaredVariables() {
        this._declaredVariables.clear();
    }
    isAtEnd() {
        return this._cursor >= this._tokens.length;
    }
    advance() {
        return this._tokens[this._cursor++];
    }
    peek() {
        return this._tokens[this._cursor];
    }
    reportError(message) {
        this._errors.push(message);
    }
}
exports.Parsing = Parsing;
