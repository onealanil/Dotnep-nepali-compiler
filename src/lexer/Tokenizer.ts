import { Token } from "./token_type/Token";
import { TokenType } from "./token_type/TokenType";
import { custom_keywords } from "./keywords/custom_keywords";
import { InvalidStateException } from "./exceptions/InvalidStateException";
import { CustomError } from "../parser/errors/CustomErrors";

export class Tokenizer {
    private _string: string | undefined = undefined;
    private _cursor: number;

    
    constructor() {
        this._cursor = 0;
    }

    public reset(): void {
        this._string = undefined;
        this._cursor = 0;
    }

    initTokenizer(stringToTokenize: string) {
        this._string = stringToTokenize;
        this._cursor = 0;
    }

    isEOF(): boolean {
        if (!this._string) return true;
        return this._cursor >= this._string.length;
    }

    hasMoreTokens(): boolean {
        if (!this._string) return false;
        return this._cursor < this._string.length;
    }

    getNextToken(): Token | null {
        if (!this._string) {
            throw new InvalidStateException(
                "Tokenizer is not initialized with string. Please call initTokenizer method first."
            );
        }

        if (!this.hasMoreTokens()) {
            return { type: TokenType.EOF, value: "" };
        }

        const string = this._string.slice(this._cursor);

        //++ and -- operators
        if (/^\+\+/.test(string)) {
            this._cursor += 2;
            return { type: TokenType.OPERATOR, value: "++" };
        }

        // Skip whitespace
        if (/^\s/.test(string)) {
            this._cursor++;
            return this.getNextToken();
        }
        //if null 
        if (/^null/.test(string)) {
            this._cursor += 4;
            return { type: TokenType.Null, value: "null" };
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
            return { type: TokenType.SEMICOLON, value: ";" };
        }

        // Match parentheses and braces
        if (/^\(/.test(string)) {
            this._cursor++;
            return { type: TokenType.LeftParen, value: "(" };
        }

        if (/^\)/.test(string)) {
            this._cursor++;
            return { type: TokenType.RightParen, value: ")" };
        }

        if (/^\{/.test(string)) {
            this._cursor++;
            return { type: TokenType.LeftBrace, value: "{" };
        }

        if (/^\}/.test(string)) {
            this._cursor++;
            return { type: TokenType.RightBrace, value: "}" };
        }

        if (/^\[/.test(string)) {
            this._cursor++;
            return { type: TokenType.LeftSquare, value: "[" };
        }

        if (/^\]/.test(string)) {
            this._cursor++;
            return { type: TokenType.RightSquare, value: "]" };
        }
        if(/^,/.test(string)){
            this._cursor++;
            return { type: TokenType.COMMA, value: "," };
        }

        throw new CustomError(`Unexpected token: "${string[0]}"`);
    }

    private _matchIdentifierOrKeyword(): Token {
        if (this._string!.slice(this._cursor, this._cursor + 11) === "haina bhane") {
            this._cursor += 11;
            return { type: TokenType.ELSE, value: "haina bhane" };
        }
        if (this._string!.slice(this._cursor, this._cursor + 10) === "jaba samma") {
            this._cursor += 10;
            return { type: TokenType.WHILE, value: "jaba samma" };
        }
        if (this._string!.slice(this._cursor, this._cursor + 10) === "jaari rakh") {
            this._cursor += 10;
            return { type: TokenType.CONTINUE, value: "jaari rakh" };
        }
        if (this._string!.slice(this._cursor, this._cursor + 13) === "kaam ra firta") {
            this._cursor += 13;
            return { type: TokenType.FUNCTION, value: "kaam ra firta" };
        }

        let ident = "";
        // Updated regex to include underscores
        while (this._cursor < this._string!.length && /[a-zA-Z0-9_]/.test(this._string![this._cursor])) {
            ident += this._string![this._cursor];
            this._cursor++;
        }

        if (custom_keywords.includes(ident)) {
            if (ident === "nikaal") {
                return { type: TokenType.PRINT, value: ident };
            }
            if (ident === "yedi") {
                return { type: TokenType.IF, value: ident };
            }
            if (ident === "navaye") {
                return { type: TokenType.ELSEIF, value: ident };
            }
            if (ident === "sahi" || ident === "galat") {
                return { type: TokenType.BOOLEAN, value: ident };
            }
            if (ident === "bhayo") {
                return { type: TokenType.BREAK, value: ident };
            }
            if (ident === "kaam") {
                return { type: TokenType.FUNCTION, value: ident };
            }
            if (ident === "firta") {
                return { type: TokenType.RETURN, value: ident };
            }
            return { type: TokenType.KEYWORD, value: ident };
        }

        return { type: TokenType.IDENTIFIER, value: ident };
    }

    private _matchNumber(): Token {
        let num = "";
        while (this._cursor < this._string!.length && /[0-9]/.test(this._string![this._cursor])) {
            num += this._string![this._cursor];
            this._cursor++;
        }
        return { type: TokenType.NUMBER, value: num };
    }

    private _matchOperator(): Token {
        const string = this._string!.slice(this._cursor);

        if (/^[<>]=/.test(string)) {
            const operator = string.slice(0, 2);
            this._cursor += 2;
            return { type: TokenType.OPERATOR, value: operator };
        } else if (/^[<>]/.test(string)) {
            const operator = string[0];
            this._cursor++;
            return { type: TokenType.OPERATOR, value: operator };
        } else if (/^==/.test(string)) {
            this._cursor += 2;
            return { type: TokenType.OPERATOR, value: "==" };
        } else if (/^!=/.test(string)) {
            this._cursor += 2;
            return { type: TokenType.OPERATOR, value: "!=" };
            
        } else if (/^[=]/.test(string)) {
            this._cursor++;
            return { type: TokenType.OPERATOR, value: "=" };
        }

        const operator = this._string![this._cursor];
        this._cursor++;
        return { type: TokenType.OPERATOR, value: operator };
    }

    private _matchDoubleQuoteWithText(): Token {
        let text = "";
        this._cursor++;
        while (this._cursor < this._string!.length && this._string![this._cursor] !== '"') {
            text += this._string![this._cursor];
            this._cursor++;
        }
        this._cursor++;
        return { type: TokenType.STRING, value: text };
    }
}
