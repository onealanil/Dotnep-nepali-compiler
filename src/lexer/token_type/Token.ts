/**
 * @file Token.ts
 * @brief This file defines the Token interface used in the lexer.
 * It represents a token with its value and type.
 * @details
 * The Token interface is used to represent a token in the lexer.
 * It contains two properties:
 * - value: The string value of the token.
 * - type: The type of the token, which is a string.
 * @note
 * This interface is used in the lexer to represent tokens.
 * It is not intended to be used outside of the lexer.
 * @warning
 * This interface is not intended to be used outside of the lexer.
 * It is not intended to be used in the parser or the interpreter.
 */
export interface Token {
    value: string,
    type: string,
}