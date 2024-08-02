import { Token } from "../../lexer/token_type/Token";
import { ASTNodeType, ProgramNode } from "../AST/ast";
import { parseAssignmentStatement } from "../Declarations/AssignmentOperator";
import { parseIfStatement } from "../Declarations/IfStatement";
import { parsePrintStatement } from "../Declarations/PrintStatement";
import { parseVariableDeclaration } from "../Declarations/VariableDeclaration";
import { parseWhileStatement } from "../Declarations/WhileParser";
import { parseFunctionDeclaration } from "../Declarations/FunctionParser";
import { parseFunctionCall } from "../Declarations/FunctionCall";
import { CustomError } from "../errors/CustomErrors";
import { variableInfo } from "../helper/Interfaces";

export class Parsing {
    private _tokens: Token[] = [];
    private _cursor: number = 0;
    private _errors: string[] = [];
    private _declaredVariables: Map<string, variableInfo> = new Map();

    constructor() {
        this._declaredVariables = new Map();
    }

    public reset(): void {
        this._tokens = [];
        this._cursor = 0;
        this._errors = [];
        this._declaredVariables.clear();
      }

    // Initialize the parser with tokens
    initializeParsing(tokens: Token[]): void {
        this.reset();
        this._tokens = tokens;
        this._cursor = 0;
        this._errors = [];
        this._declaredVariables.clear();
    }

    // Produce AST
    public producedAST(): ProgramNode {
        const program: ProgramNode = {
            type: ASTNodeType.Program,
            body: [],
        };

        while (!this.isAtEnd()) {
            const token = this.peek();
            if (token.type === "KEYWORD" && token.value === "rakh") {
                const result = parseVariableDeclaration(
                    this._tokens,
                    this._cursor,
                    this._declaredVariables,
                    this.reportError.bind(this),
                );
                this._cursor = result.cursor;
                program.body.push(result.declaration);
            } else if (token.type === "PRINT" && token.value === "nikaal") {
                const result = parsePrintStatement(
                    this._tokens,
                    this._cursor,
                    this._declaredVariables,
                    this.reportError.bind(this),
                );
                this._cursor = result.cursor;
                program.body.push(result.printNode);
            } else if (token.type === "IDENTIFIER") {
                const nextToken = this._tokens[this._cursor + 1];
                if (nextToken && nextToken.type === "LeftParen") {
                    const callResult = parseFunctionCall(
                        this._tokens,
                        this._cursor,
                        this.reportError.bind(this),
                    );
                    this._cursor = callResult.cursor;
                    program.body.push(callResult.call);
                } else {
                    const result = parseAssignmentStatement(
                        this._tokens,
                        this._cursor,
                        this._declaredVariables,
                        this.reportError.bind(this),
                    );
                    this._cursor = result.cursor;
                    program.body.push(result.assignment);
                }
            } else if (token.type === "IF" && token.value === "yedi") {
                const result = parseIfStatement(
                    this._tokens,
                    this._cursor,
                    this._declaredVariables,
                    this.reportError.bind(this),
                );
                this._cursor = result.cursor;
                program.body.push(result.ifStatement);
            } else if (token.type === "WHILE" && token.value === "jaba samma") {
                const result = parseWhileStatement(
                    this._tokens,
                    this._cursor,
                    this._declaredVariables,
                    this.reportError.bind(this),
                );
                this._cursor = result.cursor;
                program.body.push(result.whileStatement);
            } else if ((token.type === "FUNCTION" && token.value === "kaam") ||
                       (token.type === "FUNCTION" && token.value === "kaam ra firta")) {
                const result = parseFunctionDeclaration(
                    this._tokens,
                    this._cursor,
                    this.reportError.bind(this),
                    this._declaredVariables,
                );
                this._cursor = result.cursor;
                program.body.push(result.declaration);
            } else if (token.type === "EOF") {
                break;
            } else {
                this.reportError(`Unexpected token: ${token.value} at position ${this._cursor}`);
                this.advance();
            }
        }

        if (this._errors.length > 0) {
            const errorMessage = this._errors.join('\n');
            throw new CustomError(`Parsing failed bhayo errors ko saathma:\n${errorMessage}`);
        }

        return program;
    }
    
    resetDeclaredVariables() {
        this._declaredVariables.clear();
      }

    isAtEnd(): boolean {
        return this._cursor >= this._tokens.length;
    }

    private advance(): Token {
        return this._tokens[this._cursor++];
    }

    private peek(): Token {
        return this._tokens[this._cursor];
    }

    private reportError(message: string): void {
        this._errors.push(message);
    }
}