/**
 * @file index.ts
 * @description This file serves as the entry point for the compiler. It initializes the tokenizer and parser, and provides a function to compile code.
 * @license MIT
 * @author Anil Bhandari
 * @version 1.0.0
 * @date 2023-10-01
 * @includes
 * - Tokenizer: A class that tokenizes the input code.
 * - Parsing: A class that parses the tokens into an Abstract Syntax Tree (AST).
 * - eval_program: A function that evaluates the AST and returns the result.
 * - resetGlobalEnvironment: A function that resets the global environment for the interpreter.
 * - CustomError: A custom error class for handling errors in the compiler.
 * @exports
 * - compile: A function that takes a string of code, tokenizes it, parses it, and evaluates it.
 * - resetCompilerState: A function that resets the state of the compiler.
 * - Tokenizer: The Tokenizer class.
 * - Parsing: The Parsing class.
 */

import { Tokenizer } from "./lexer/Tokenizer";
import { CustomError } from "./parser/errors/CustomErrors";
import { Parsing } from "./parser/parsing/_index";
import { eval_program, resetGlobalEnvironment } from "./interpreter/semanticAnalyzer/SemanticAnalyzer";
import { Token } from "./lexer/token_type/Token";
import { RuntimeVal } from "./interpreter/semanticAnalyzer/values";

const tokenizer = new Tokenizer();
const parsing = new Parsing();

/**
 * @function resetCompilerState
 * @description Resets the state of the compiler by reinitializing the tokenizer and parser, and resetting the global environment.
 * @returns void
 */
export function resetCompilerState() {
  parsing.reset();
  resetGlobalEnvironment();
}

/**
 * 
 * @param code The code to be compiled.
 * @description This function takes a string of code, tokenizes it, parses it, and evaluates it.
 * It returns the result of the evaluation and any outputs generated during the process.
 * @throws {Error} Throws an error if the code cannot be compiled.
 * @throws {CustomError} Throws a custom error if there is an issue with the code.
 * @throws {UnexpectedError} Throws an unexpected error if there is an issue with the code.
 * @returns { results: RuntimeVal; outputs: string[] } The results of the evaluation and any outputs generated.
 */
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