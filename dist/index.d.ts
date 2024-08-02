import { Tokenizer } from "./lexer/Tokenizer";
import { Parsing } from "./parser/parsing/_index";
import { RuntimeVal } from "./interpreter/semanticAnalyzer/values";
export declare function resetCompilerState(): void;
export declare function compile(code: string): {
    results: RuntimeVal;
    outputs: string[];
};
export { Tokenizer, Parsing };
