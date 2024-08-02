import { Tokenizer } from "./lexer/Tokenizer";
import { CustomError } from "./parser/errors/CustomErrors";
import { Parsing } from "./parser/parsing/_index";
import { eval_program, resetGlobalEnvironment } from "./interpreter/semanticAnalyzer/SemanticAnalyzer";
import { Token } from "./lexer/token_type/Token";
import { RuntimeVal } from "./interpreter/semanticAnalyzer/values";

const tokenizer = new Tokenizer();
const parsing = new Parsing();

export function resetCompilerState() {
  parsing.reset();
  resetGlobalEnvironment();
}

export function compile(code: string): { results: RuntimeVal; outputs: string[] } {
  tokenizer.initTokenizer(code);

  const tokens: Token[] = [];

  try {
    while (tokenizer.hasMoreTokens()) {
      const token = tokenizer.getNextToken();
      if (token) {
        tokens.push(token);
      }
    }
    
    parsing.initializeParsing(tokens);
    
    const ast = parsing.producedAST();
    return eval_program(ast);

  } catch (error: any) {
    if (error instanceof CustomError) {
      throw new Error(`Compiler Error: ${error.message}`);
    } else {
      throw new Error(`Unexpected Error: ${error.message}`);
    }
  }
}
export { Tokenizer, Parsing };