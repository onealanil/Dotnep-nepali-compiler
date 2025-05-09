/**
 * @file TokenType.ts
 * @description This file contains the TokenType enum which defines various token types used in the lexer.
 */
export enum TokenType {
    KEYWORD = "KEYWORD",
    IDENTIFIER = "IDENTIFIER",
    NUMBER = "NUMBER",
    OPERATOR = "OPERATOR",
    SEMICOLON = "SEMICOLON",
    PRINT = "PRINT",
    LeftParen = "LeftParen",
    RightParen = "RightParen",
    LeftBrace = "LeftBrace",
    RightBrace = "RightBrace",
    EOF = "EOF",
    UNKNOWN = "UNKNOWN",
    LeftSquare = "LeftSquare",
    RightSquare = "RightSquare",
    STRING = "STRING",
    BOOLEAN = "BOOLEAN",
    FUNCTION = "FUNCTION",
    RETURN = "RETURN",
    IF = "IF",
    ELSE = "ELSE",
    ELSEIF = "ELSEIF",
    WHILE = "WHILE",
    FOR = "FOR",
    COMMA = "COMMA",
    DOT = "DOT",
    Null = "Null",
    DOUBLEQUOTE = "DOUBLEQUOTE",
    INCREMENT = "Increment",
    BREAK = "BREAK",
    CONTINUE = "CONTINUE",
}

