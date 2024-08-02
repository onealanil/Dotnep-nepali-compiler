"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tokenizer = void 0;
const TokenType_1 = require("./token_type/TokenType");
const custom_keywords_1 = require("./keywords/custom_keywords");
const InvalidStateException_1 = require("./exceptions/InvalidStateException");
const CustomErrors_1 = require("../parser/errors/CustomErrors");
class Tokenizer {
    constructor() {
        this._string = undefined;
        this._cursor = 0;
    }
    reset() {
        this._string = undefined;
        this._cursor = 0;
    }
    initTokenizer(stringToTokenize) {
        this._string = stringToTokenize;
        this._cursor = 0;
    }
    isEOF() {
        if (!this._string)
            return true;
        return this._cursor >= this._string.length;
    }
    hasMoreTokens() {
        if (!this._string)
            return false;
        return this._cursor < this._string.length;
    }
    getNextToken() {
        if (!this._string) {
            throw new InvalidStateException_1.InvalidStateException("Tokenizer is not initialized with string. Please call initTokenizer method first.");
        }
        if (!this.hasMoreTokens()) {
            return { type: TokenType_1.TokenType.EOF, value: "" };
        }
        const string = this._string.slice(this._cursor);
        //++ and -- operators
        if (/^\+\+/.test(string)) {
            this._cursor += 2;
            return { type: TokenType_1.TokenType.OPERATOR, value: "++" };
        }
        // Skip whitespace
        if (/^\s/.test(string)) {
            this._cursor++;
            return this.getNextToken();
        }
        //if null 
        if (/^null/.test(string)) {
            this._cursor += 4;
            return { type: TokenType_1.TokenType.Null, value: "null" };
        }
        // Match identifiers and keywords
        if (/^[a-zA-Z]/.test(string)) {
            return this._matchIdentifierOrKeyword();
        }
        // Match numbers
        if (/^[0-9]/.test(string)) {
            return this._matchNumber();
        }
        // Match operators
        if (/^[\+\%\-\*\/\=\!\<\>]/.test(string)) {
            return this._matchOperator();
        }
        // Match double quote
        if (/^"/.test(string)) {
            return this._matchDoubleQuoteWithText();
        }
        // Match semicolons
        if (/^;/.test(string)) {
            this._cursor++;
            return { type: TokenType_1.TokenType.SEMICOLON, value: ";" };
        }
        // Match parentheses and braces
        if (/^\(/.test(string)) {
            this._cursor++;
            return { type: TokenType_1.TokenType.LeftParen, value: "(" };
        }
        if (/^\)/.test(string)) {
            this._cursor++;
            return { type: TokenType_1.TokenType.RightParen, value: ")" };
        }
        if (/^\{/.test(string)) {
            this._cursor++;
            return { type: TokenType_1.TokenType.LeftBrace, value: "{" };
        }
        if (/^\}/.test(string)) {
            this._cursor++;
            return { type: TokenType_1.TokenType.RightBrace, value: "}" };
        }
        if (/^\[/.test(string)) {
            this._cursor++;
            return { type: TokenType_1.TokenType.LeftSquare, value: "[" };
        }
        if (/^\]/.test(string)) {
            this._cursor++;
            return { type: TokenType_1.TokenType.RightSquare, value: "]" };
        }
        if (/^,/.test(string)) {
            this._cursor++;
            return { type: TokenType_1.TokenType.COMMA, value: "," };
        }
        throw new CustomErrors_1.CustomError(`Unexpected token: "${string[0]}"`);
    }
    _matchIdentifierOrKeyword() {
        if (this._string.slice(this._cursor, this._cursor + 11) === "haina bhane") {
            this._cursor += 11;
            return { type: TokenType_1.TokenType.ELSE, value: "haina bhane" };
        }
        if (this._string.slice(this._cursor, this._cursor + 10) === "jaba samma") {
            this._cursor += 10;
            return { type: TokenType_1.TokenType.WHILE, value: "jaba samma" };
        }
        if (this._string.slice(this._cursor, this._cursor + 10) === "jaari rakh") {
            this._cursor += 10;
            return { type: TokenType_1.TokenType.CONTINUE, value: "jaari rakh" };
        }
        if (this._string.slice(this._cursor, this._cursor + 13) === "kaam ra firta") {
            this._cursor += 13;
            return { type: TokenType_1.TokenType.FUNCTION, value: "kaam ra firta" };
        }
        let ident = "";
        // Updated regex to include underscores
        while (this._cursor < this._string.length && /[a-zA-Z0-9_]/.test(this._string[this._cursor])) {
            ident += this._string[this._cursor];
            this._cursor++;
        }
        if (custom_keywords_1.custom_keywords.includes(ident)) {
            if (ident === "nikaal") {
                return { type: TokenType_1.TokenType.PRINT, value: ident };
            }
            if (ident === "yedi") {
                return { type: TokenType_1.TokenType.IF, value: ident };
            }
            if (ident === "navaye") {
                return { type: TokenType_1.TokenType.ELSEIF, value: ident };
            }
            if (ident === "sahi" || ident === "galat") {
                return { type: TokenType_1.TokenType.BOOLEAN, value: ident };
            }
            if (ident === "bhayo") {
                return { type: TokenType_1.TokenType.BREAK, value: ident };
            }
            if (ident === "kaam") {
                return { type: TokenType_1.TokenType.FUNCTION, value: ident };
            }
            if (ident === "firta") {
                return { type: TokenType_1.TokenType.RETURN, value: ident };
            }
            return { type: TokenType_1.TokenType.KEYWORD, value: ident };
        }
        return { type: TokenType_1.TokenType.IDENTIFIER, value: ident };
    }
    _matchNumber() {
        let num = "";
        while (this._cursor < this._string.length && /[0-9]/.test(this._string[this._cursor])) {
            num += this._string[this._cursor];
            this._cursor++;
        }
        return { type: TokenType_1.TokenType.NUMBER, value: num };
    }
    _matchOperator() {
        const string = this._string.slice(this._cursor);
        if (/^[<>]=/.test(string)) {
            const operator = string.slice(0, 2);
            this._cursor += 2;
            return { type: TokenType_1.TokenType.OPERATOR, value: operator };
        }
        else if (/^[<>]/.test(string)) {
            const operator = string[0];
            this._cursor++;
            return { type: TokenType_1.TokenType.OPERATOR, value: operator };
        }
        else if (/^==/.test(string)) {
            this._cursor += 2;
            return { type: TokenType_1.TokenType.OPERATOR, value: "==" };
        }
        else if (/^!=/.test(string)) {
            this._cursor += 2;
            return { type: TokenType_1.TokenType.OPERATOR, value: "!=" };
        }
        else if (/^[=]/.test(string)) {
            this._cursor++;
            return { type: TokenType_1.TokenType.OPERATOR, value: "=" };
        }
        const operator = this._string[this._cursor];
        this._cursor++;
        return { type: TokenType_1.TokenType.OPERATOR, value: operator };
    }
    _matchDoubleQuoteWithText() {
        let text = "";
        this._cursor++;
        while (this._cursor < this._string.length && this._string[this._cursor] !== '"') {
            text += this._string[this._cursor];
            this._cursor++;
        }
        this._cursor++;
        return { type: TokenType_1.TokenType.STRING, value: text };
    }
}
exports.Tokenizer = Tokenizer;
