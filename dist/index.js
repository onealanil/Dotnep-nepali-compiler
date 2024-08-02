"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parsing = exports.Tokenizer = exports.compile = exports.resetCompilerState = void 0;
const Tokenizer_1 = require("./lexer/Tokenizer");
Object.defineProperty(exports, "Tokenizer", { enumerable: true, get: function () { return Tokenizer_1.Tokenizer; } });
const CustomErrors_1 = require("./parser/errors/CustomErrors");
const _index_1 = require("./parser/parsing/_index");
Object.defineProperty(exports, "Parsing", { enumerable: true, get: function () { return _index_1.Parsing; } });
const SemanticAnalyzer_1 = require("./interpreter/semanticAnalyzer/SemanticAnalyzer");
const tokenizer = new Tokenizer_1.Tokenizer();
const parsing = new _index_1.Parsing();
function resetCompilerState() {
    parsing.reset();
    (0, SemanticAnalyzer_1.resetGlobalEnvironment)();
}
exports.resetCompilerState = resetCompilerState;
function compile(code) {
    tokenizer.initTokenizer(code);
    const tokens = [];
    try {
        while (tokenizer.hasMoreTokens()) {
            const token = tokenizer.getNextToken();
            if (token) {
                tokens.push(token);
            }
        }
        parsing.initializeParsing(tokens);
        const ast = parsing.producedAST();
        return (0, SemanticAnalyzer_1.eval_program)(ast);
    }
    catch (error) {
        if (error instanceof CustomErrors_1.CustomError) {
            throw new Error(`Compiler Error: ${error.message}`);
        }
        else {
            throw new Error(`Unexpected Error: ${error.message}`);
        }
    }
}
exports.compile = compile;
