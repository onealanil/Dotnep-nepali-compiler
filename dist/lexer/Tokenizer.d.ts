import { Token } from "./token_type/Token";
export declare class Tokenizer {
    private _string;
    private _cursor;
    constructor();
    reset(): void;
    initTokenizer(stringToTokenize: string): void;
    isEOF(): boolean;
    hasMoreTokens(): boolean;
    getNextToken(): Token | null;
    private _matchIdentifierOrKeyword;
    private _matchNumber;
    private _matchOperator;
    private _matchDoubleQuoteWithText;
}
