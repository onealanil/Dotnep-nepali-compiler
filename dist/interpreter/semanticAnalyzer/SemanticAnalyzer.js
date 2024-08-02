"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluate = exports.eval_program = exports.resetGlobalEnvironment = exports.Environment = void 0;
const ast_1 = require("../../parser/AST/ast");
const BreakStatementException_1 = require("../exception/BreakStatementException");
const ContinueStatementException_1 = require("../exception/ContinueStatementException");
class Environment {
    constructor(parent = null) {
        this.outputs = [];
        this.parent = parent;
        this.variables = {};
    }
    define(name, value) {
        this.variables[name] = value;
    }
    assign(name, value) {
        if (name in this.variables) {
            this.variables[name] = value;
        }
        else if (this.parent) {
            this.parent.assign(name, value);
        }
        else {
            throw new Error(`Variable '${name}' is not defined.`);
        }
    }
    lookup(name) {
        if (name in this.variables) {
            return this.variables[name];
        }
        else if (this.parent) {
            return this.parent.lookup(name);
        }
        else {
            throw new Error(`Variable '${name}' is not defined.`);
        }
    }
    addOutput(output) {
        this.outputs.push(output);
    }
}
exports.Environment = Environment;
let globalEnv;
function resetGlobalEnvironment() {
    globalEnv = new Environment();
}
exports.resetGlobalEnvironment = resetGlobalEnvironment;
function eval_program(program) {
    console.log("Resetting global environment");
    const globalEnv = new Environment(); // Ensure a new instance is created for each run
    let lastEvaluated = { type: "null", value: null };
    for (const statement of program.body) {
        lastEvaluated = evaluate(statement, globalEnv);
    }
    console.log("Global environment after evaluation:", globalEnv);
    return { results: lastEvaluated, outputs: globalEnv.outputs };
}
exports.eval_program = eval_program;
function eval_variable_declaration(node, env) {
    const value = evaluate(node.init, env);
    env.define(node.identifier.name, value);
    return value;
}
function eval_assignment(node, env) {
    const value = evaluate(node.value, env);
    env.assign(node.identifier.name, value);
    return value;
}
function eval_binary_expr(node, env) {
    const left = evaluate(node.left, env);
    const right = evaluate(node.right, env);
    if (left.type === "number" && right.type === "number") {
        switch (node.operator) {
            case "+":
                return { type: "number", value: left.value + right.value };
            case "-":
                return { type: "number", value: left.value - right.value };
            case "*":
                return { type: "number", value: left.value * right.value };
            case "/":
                if (right.value !== 0) {
                    return { type: "number", value: left.value / right.value };
                }
                else {
                    throw new Error("Division by zero is not allowed.");
                }
            case "%":
                if (right.value !== 0) {
                    return { type: "number", value: left.value % right.value };
                }
                else {
                    throw new Error("Division by zero is not allowed.");
                }
            case "<":
                return { type: "boolean", value: left.value < right.value };
            case ">":
                return { type: "boolean", value: left.value > right.value };
            case "<=":
                return { type: "boolean", value: left.value <= right.value };
            case ">=":
                return { type: "boolean", value: left.value >= right.value };
            case "==":
                return { type: "boolean", value: left.value === right.value };
            case "!=":
                return { type: "boolean", value: left.value !== right.value };
            default:
                throw new Error(`Unsupported operator: ${node.operator}`);
        }
    }
    else if (left.type === "string" || right.type === "string") {
        switch (node.operator) {
            case "+":
                return { type: "string", value: left.value.toString() + right.value.toString() };
            case "==":
                return { type: "boolean", value: left.value === right.value };
            default:
                throw new Error(`Unsupported operator for strings: ${node.operator}`);
        }
    }
    else {
        throw new Error("Operands must be numbers or strings.");
    }
}
function eval_identifier(node, env) {
    return env.lookup(node.name);
}
function eval_numeric_literal(node) {
    return { type: "number", value: node.value };
}
function eval_string_literal(node) {
    return { type: "string", value: node.value };
}
function eval_print(node, env) {
    const value = evaluate(node.value, env);
    let result = "";
    if (value.type === "string") {
        result = value.value;
    }
    else if (value.type === "number" || value.type === "boolean") {
        result = value.value.toString();
    }
    else {
        throw new Error(`Unsupported value type for print: ${value.type}`);
    }
    env.addOutput(result);
    return value;
}
function eval_increment(node, env) {
    const variable = env.lookup(node.identifier.name);
    if (variable.type !== "number") {
        throw new Error(`Variable '${node.identifier.name}' is not a number.`);
    }
    const newValue = { type: "number", value: variable.value + 1 };
    env.assign(node.identifier.name, newValue);
    return newValue;
}
function eval_if_statement(node, env) {
    const test = evaluate(node.test, env);
    if (test.type !== "boolean") {
        throw new Error("If statement test expression must be a boolean.");
    }
    if (test.value) {
        return eval_block_statement(node.consequent, env);
    }
    else if (node.alternate) {
        return evaluate(node.alternate, env);
    }
    return { type: "null", value: null };
}
function eval_block_statement(node, env) {
    const blockEnv = new Environment(env);
    let lastEvaluated = { type: "null", value: null };
    for (const statement of node.body) {
        lastEvaluated = evaluate(statement, blockEnv);
    }
    env.outputs.push(...blockEnv.outputs);
    return lastEvaluated;
}
function eval_boolean_literal(node) {
    return { type: "boolean", value: node.value };
}
function eval_while_statement(node, env) {
    let lastEvaluated = { type: "null", value: null };
    while (true) {
        const testResult = evaluate(node.test, env);
        if (testResult.type !== "boolean") {
            throw new Error("While statement test expression must be a boolean.");
        }
        if (!testResult.value) {
            break;
        }
        try {
            lastEvaluated = eval_block_statement(node.body, env);
        }
        catch (e) {
            if (e instanceof BreakStatementException_1.BreakStatementException) {
                break;
            }
            else if (e instanceof ContinueStatementException_1.ContinueStatementException) {
                continue;
            }
            else {
                throw e;
            }
        }
    }
    return lastEvaluated;
}
function eval_function_declaration(node, env) {
    const funcValue = {
        type: "function",
        value: {
            params: node.params.map((param) => param.name),
            body: node.body,
            env: env,
        },
    };
    env.define(node.name.name, funcValue);
    return funcValue;
}
function eval_return_statement(node, env) {
    if (node.argument) {
        return evaluate(node.argument, env);
    }
    else {
        return { type: "null", value: null };
    }
}
function eval_function_call(node, env) {
    const func = env.lookup(node.callee.name);
    if (func.type !== "function") {
        throw new Error(`${node.callee.name} is not a function.`);
    }
    const functionEnv = new Environment(func.value.env);
    for (let i = 0; i < func.value.params.length; i++) {
        const paramName = func.value.params[i];
        const argValue = evaluate(node.args[i], env);
        functionEnv.define(paramName, argValue);
    }
    let result = { type: "null", value: null };
    try {
        result = evaluate(func.value.body, functionEnv);
    }
    catch (e) {
        throw e;
    }
    env.outputs.push(...functionEnv.outputs);
    return result;
}
function evaluate(node, env) {
    switch (node.type) {
        case ast_1.ASTNodeType.Program:
            const { results } = eval_program(node);
            return results;
        case ast_1.ASTNodeType.VariableDeclaration:
            return eval_variable_declaration(node, env);
        case ast_1.ASTNodeType.Assignment:
            return eval_assignment(node, env);
        case ast_1.ASTNodeType.BinaryExpression:
            return eval_binary_expr(node, env);
        case ast_1.ASTNodeType.Identifier:
            return eval_identifier(node, env);
        case ast_1.ASTNodeType.NumericLiteral:
            return eval_numeric_literal(node);
        case ast_1.ASTNodeType.String:
            return eval_string_literal(node);
        case ast_1.ASTNodeType.Increment:
            return eval_increment(node, env);
        case ast_1.ASTNodeType.Print:
            return eval_print(node, env);
        case ast_1.ASTNodeType.IfStatement:
            return eval_if_statement(node, env);
        case ast_1.ASTNodeType.BlockStatement:
            return eval_block_statement(node, env);
        case ast_1.ASTNodeType.BooleanLiteral:
            return eval_boolean_literal(node);
        case ast_1.ASTNodeType.WhileStatement:
            return eval_while_statement(node, env);
        case ast_1.ASTNodeType.FunctionDeclaration:
            return eval_function_declaration(node, env);
        case ast_1.ASTNodeType.ReturnStatement:
            return eval_return_statement(node, env);
        case ast_1.ASTNodeType.FunctionCall:
            return eval_function_call(node, env);
        case ast_1.ASTNodeType.BreakStatement:
            throw new BreakStatementException_1.BreakStatementException();
        case ast_1.ASTNodeType.ContinueStatement:
            throw new ContinueStatementException_1.ContinueStatementException();
        default:
            throw new Error(`Unsupported AST node type: ${node.type}`);
    }
}
exports.evaluate = evaluate;
