import { Token } from "../../lexer/token_type/Token";
import { ASTNodeType, FunctionDeclarationNode, BlockStatementNode, IdentifierNode } from "../AST/ast";
import { CustomError } from "../errors/CustomErrors";
import { variableInfo as VariableInfo } from "../helper/Interfaces";
import { parseAssignmentStatement } from "./AssignmentOperator";
import { parseBinaryExpression } from "./ExpressionParser";
import { parseFunctionCall } from "./FunctionCall";
import { parseIfStatement } from "./IfStatement";
import { parsePrintStatement } from "./PrintStatement";
import { parseVariableDeclaration } from "./VariableDeclaration";
import { parseWhileStatement } from "./WhileParser";

const globalVariables: Map<string, VariableInfo> = new Map();

export function parseFunctionDeclaration(
    tokens: Token[],
    cursor: number,
    reportError: (message: string) => void,
    declaredVariables: Map<string, VariableInfo>,
): { declaration: FunctionDeclarationNode, cursor: number } {
    let returns = false;

    if (tokens[cursor].type === "FUNCTION" && tokens[cursor].value === "kaam ra firta") {
        returns = true;
    } else if (tokens[cursor].type === "FUNCTION" && tokens[cursor].value === "kaam") {
        returns = false;
    } else {
        reportError(`'kaam ra firta' or 'kaam' expect gareko thiyo, at position ${cursor}`);
        throw new CustomError(`'kaam ra firta' or 'kaam' expect gareko thiyo, at position ${cursor}`);
    }
    cursor++;

    const nameToken = tokens[cursor];
    if (nameToken.type !== "IDENTIFIER") {
        reportError(`Function name expect gareko thiyo, at position ${cursor}`);
        throw new CustomError(`Function name expect gareko thiyo, at position ${cursor}`);
    }
    const name: IdentifierNode = {
        type: ASTNodeType.Identifier,
        name: nameToken.value
    };
    cursor++; 

    if (tokens[cursor].type !== "LeftParen") {
        reportError(`'(' expect gareko thiyo, function name pachhi at position ${cursor}`);
        throw new CustomError(`'(' expect gareko thiyo, function name pachhi at position ${cursor}`);
    }
    cursor++; 

    const params: IdentifierNode[] = [];
    while (tokens[cursor].type !== "RightParen") {
        if (tokens[cursor].type !== "IDENTIFIER") {
            reportError(`Parameter name expect gareko thiyo, at position ${cursor}`);
            throw new CustomError(`Parameter name expect gareko thiyo, at position ${cursor}`);
        }
        params.push({
            type: ASTNodeType.Identifier,
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
        } else if (tokens[cursor].type !== "RightParen") {
            reportError(`',' athaba ')' expect gareko thiyo at position ${cursor}`);
            throw new CustomError(` ',' athaba ')' gareko thiyo at position ${cursor}`);
        }
    }
    cursor++; 

    if (tokens[cursor].type !== "LeftBrace") {
        reportError(`'{' expect gareko thiyo function parameters pacchi, at position ${cursor}`);
        throw new CustomError(`'{' expect gareko thiyo function parameters pachhi, at position ${cursor}`);
    }
    cursor++; 

    const bodyResult = parseBlockStatement(tokens, cursor, reportError, declaredVariables);
    cursor = bodyResult.cursor; 

    if (returns) {
        let hasReturnStatement = false;
        for (const statement of bodyResult.block.body) {
            if (statement.type === ASTNodeType.ReturnStatement) {
                hasReturnStatement = true;
                break;
            }
        }
        if (!hasReturnStatement) {
            reportError(`Function '${name.name}' requires 'kaam ra firta' declaration tara 'firta' statement ko kami bhayo.`);
            throw new CustomError(`Function '${name.name}' requires 'kaam ra firta' declaration tara 'firta' statement ko kami bhayo.`);
        }
    } else {
        for (const statement of bodyResult.block.body) {
            if (statement.type === ASTNodeType.ReturnStatement) {
                reportError(`Function '${name.name}' is declared with 'kaam' teibhayera 'firta' statement ko jarurat chhaina.`);
                throw new CustomError(`Function '${name.name}' is declared with 'kaam' teibhayera 'firta' statement ko jarurat chhaina.`);
            }
        }
    }

    const functionDeclaration: FunctionDeclarationNode = {
        type: ASTNodeType.FunctionDeclaration,
        name,
        params,
        body: bodyResult.block,
        returns
    };

    return { declaration: functionDeclaration, cursor };
}

export function parseReturnStatement(
    tokens: Token[],
    cursor: number,
    reportError: (message: string) => void,
): { statement: any, cursor: number } {
    const returnToken = tokens[cursor];
    if (returnToken.type !== "RETURN" || returnToken.value !== "firta") {
        reportError(`'firta' expect gareko thiyo, at position ${cursor}`);
        throw new CustomError(`'firta' expect gareko thiyo, at position ${cursor}`);
    }
    cursor++; 

    const result = parseBinaryExpression(tokens, cursor);
    cursor = result.cursor;

    const returnStatement = {
        type: ASTNodeType.ReturnStatement,
        argument: result.node
    };

    if (tokens[cursor].type !== "SEMICOLON") {
        reportError(`';' expect garko thiyo 'firta' pachhi, tara '${tokens[cursor].value}' vetiyo.`);
        throw new CustomError(`';' expect gareko thiyo 'firta' pachhi, tara '${tokens[cursor].value}' vetiyo.`);
    }
    cursor++; 

    return { statement: returnStatement, cursor };
}

function parseBlockStatement(
    tokens: Token[],
    cursor: number,
    reportError: (message: string) => void,
    declaredVariables: Map<string, VariableInfo>
): { block: BlockStatementNode, cursor: number } {
    const block: BlockStatementNode = {
        type: ASTNodeType.BlockStatement,
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

function parseStatement(
    tokens: Token[],
    cursor: number,
    declaredVariables: Map<string, VariableInfo>,
    reportError: (message: string) => void
): { statement: any, cursor: number } {
    const token = tokens[cursor];

    if (token.type === "IDENTIFIER") {
        if (tokens[cursor + 1]?.type === "LeftParen") {
            const result = parseFunctionCall(tokens, cursor, reportError);
            return { statement: result.call, cursor: result.cursor };
        } else {
            const identifier = token.value;
            const isInFunctionScope = declaredVariables.has(identifier);
            const isInGlobalScope = globalVariables.has(identifier);

            if (isInFunctionScope) {
                const result = parseAssignmentStatement(tokens, cursor, declaredVariables, reportError);
                return { statement: result.assignment, cursor: result.cursor };
            } else if (isInGlobalScope) {
                const result = parseGlobalVariable(tokens, cursor, globalVariables, reportError);
                return { statement: result.variable, cursor: result.cursor };
            } else {
                reportError(`Variable '${identifier}' declared gareko chhaina.`);
                throw new CustomError(`Variable '${identifier}' declared gareko chhaina.`);
            }
        }
    } else if (token.type === "KEYWORD" && token.value === "rakh") {
        const result = parseVariableDeclaration(tokens, cursor, declaredVariables, reportError);
        return { statement: result.declaration, cursor: result.cursor };
    } else if (token.type === "PRINT" && token.value === "nikaal") {
        const result = parsePrintStatement(tokens, cursor, declaredVariables, reportError);
        return { statement: result.printNode, cursor: result.cursor };
    } else if (token.type === "IF" && token.value === "yedi") {
        const result = parseIfStatement(tokens, cursor, declaredVariables, reportError);
        return { statement: result.ifStatement, cursor: result.cursor };
    } else if (token.type === "WHILE" && token.value === "jaba samma") {
        const result = parseWhileStatement(tokens, cursor, declaredVariables, reportError);
        return { statement: result.whileStatement, cursor: result.cursor };
    } else if (token.type === "RETURN" && token.value === "firta") {
        const result = parseReturnStatement(tokens, cursor, reportError);
        return { statement: result.statement, cursor: result.cursor };
    } else if (token.type === "SEMICOLON") {
        cursor++;
        return { statement: null, cursor };
    }

    throw new CustomError(`Unexpected statement type: ${token.type} at position ${cursor}`);
}

function parseGlobalVariable(
    tokens: Token[],
    cursor: number,
    globalVariables: Map<string, VariableInfo>,
    reportError: (message: string) => void
): { variable: any, cursor: number } {
    const variableName = tokens[cursor].value;

    if (globalVariables.has(variableName)) {
        reportError(`Variable '${variableName}' agaadinai global variable ma declared garisakeko chha.`);
        throw new CustomError(`Variable '${variableName}' agaadinai global variable ma declared garisakeko chha.`);
    }
    const result = parseVariableDeclaration(tokens, cursor, globalVariables, reportError);
    return { variable: result.declaration, cursor: result.cursor };
}
