/**
 * @file FunctionCall.ts
 * @description This file contains the function to parse function call statements in the language.
 * @includes parseFunctionCall
 * @exports parseFunctionCall
 */
import { Token } from "../../lexer/token_type/Token";
import { ASTNodeType, FunctionCallNode, IdentifierNode, ASTNode } from "../AST/ast";
import { CustomError } from "../errors/CustomErrors";
import { parseBinaryExpression } from "./ExpressionParser";

/**
 * @function parseFunctionCall
 * @param tokens - The list of tokens to be parsed.
 * @param cursor - The current position in the list of tokens.
 * @param reportError - A function to report errors during parsing.
 * @description This function parses a function call from the list of tokens.
 * It expects the function name to be an identifier followed by a left parenthesis '('.
 * The arguments are parsed until a right parenthesis ')' is encountered.
 * It also checks for a semicolon ';' at the end of the function call.
 * If any of these conditions are not met, an error is reported.
 * @returns { call: FunctionCallNode, cursor: number } - The parsed function call node and the updated cursor position.
 */
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

/**
 * @function parseExpression
 * @param tokens - The list of tokens to be parsed.
 * @param cursor - The current position in the list of tokens.
 * @returns { expression: ASTNode, cursor: number } - The parsed expression node and the updated cursor position.
 * @description This function is a wrapper around parseBinaryExpression to handle the parsing of expressions.
 * It takes the list of tokens and the current cursor position, and returns the parsed expression node along with the updated cursor position.
 */
function parseExpression(
    tokens: Token[], 
    cursor: number, 
): { expression: ASTNode, cursor: number } {
    const result = parseBinaryExpression(tokens, cursor);
    return { expression: result.node, cursor: result.cursor };
}
