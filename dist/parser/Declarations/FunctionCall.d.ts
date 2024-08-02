import { Token } from "../../lexer/token_type/Token";
import { FunctionCallNode } from "../AST/ast";
export declare function parseFunctionCall(tokens: Token[], cursor: number, reportError: (message: string) => void): {
    call: FunctionCallNode;
    cursor: number;
};
