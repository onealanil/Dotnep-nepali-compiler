import { Token } from "../../lexer/token_type/Token";
import { ASTNodeType, FunctionCallNode, IdentifierNode, ASTNode } from "../AST/ast";
import { CustomError } from "../errors/CustomErrors";
import { parseBinaryExpression } from "./ExpressionParser";

export function parseFunctionCall(
    tokens: Token[], 
    cursor: number, 
    reportError: (message: string) => void
): { call: FunctionCallNode, cursor: number } {
    const nameToken = tokens[cursor];
    if (nameToken.type !== "IDENTIFIER") {
        reportError(`Function name expect gareko thiyo,  at position ${cursor}`);
        throw new CustomError(`Function name expect gareko thiyo, at position ${cursor}`);
    }
    const callee: IdentifierNode = {
        type: ASTNodeType.Identifier,
        name: nameToken.value
    };
    cursor++; 

    if (tokens[cursor].type !== "LeftParen") {
        reportError(`'(' expect gareko thiyo, function name pachhi, at position ${cursor}`);
        throw new CustomError(`'(' expect gareko thiyo, function name pachhi, at position ${cursor}`);
    }
    cursor++;

    const args: ASTNode[] = [];
    while (tokens[cursor].type !== "RightParen" && tokens[cursor].type !== "EOF") {
        const result = parseExpression(tokens, cursor);
        args.push(result.expression);
        cursor = result.cursor;

        if (tokens[cursor].type === "COMMA") {
            cursor++; 
        } else if (tokens[cursor].type !== "RightParen") {
            reportError(`',' athaba ')' expect gareko thiyo, at position ${cursor}.`);
            throw new CustomError(` ',' athaba ')' expect gareko thiyo, at position ${cursor}.`);
        }
    }
    if (tokens[cursor].type !== "RightParen") {
        reportError(`')' expect gareko thiyo tara ${tokens[cursor].value} yo bhetiyo.`);
        throw new CustomError(`')' expect gareko thiyo tara ${tokens[cursor].value} yo bhetiyo.`);
    }
    cursor++; 

    if (tokens[cursor].type !== "SEMICOLON") {
        reportError(`';' expect gareko thiyo, function call pachhi at position ${cursor}`);
        throw new CustomError(`';' expect garko thiyo, function call pachhi at position ${cursor}`);
    }
    cursor++; 
    
    const functionCall: FunctionCallNode = {
        type: ASTNodeType.FunctionCall,
        callee,
        args
    };

    return { call: functionCall, cursor };
}

function parseExpression(
    tokens: Token[], 
    cursor: number, 
): { expression: ASTNode, cursor: number } {
    const result = parseBinaryExpression(tokens, cursor);
    return { expression: result.node, cursor: result.cursor };
}
