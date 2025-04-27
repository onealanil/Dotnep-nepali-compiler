/**
 * @file SemanticAnalyzer.ts
 * @description This file contains the implementation of the interpreter for the language.
 * It includes the evaluation of various AST nodes, such as variable declarations, assignments, binary expressions, and control flow statements.
 * It also handles function declarations and calls, as well as print statements.
 * @includes Environment, eval_program, evaluate
 * @exports eval_program, evaluate
 * @typedef {Object} Environment
 * @property {Environment | null} parent - The parent environment for scope resolution.
 */
import {
    ASTNode, ASTNodeType, ProgramNode, VariableDeclarationNode, BinaryExpressionNode, IdentifierNode,
    NumericLiteralNode, StringNode, PrintNode, AssignmentNode, IncrementNode, IfStatementNode,
    BlockStatementNode, BooleanLiteralNode, WhileStatementNode,
    FunctionDeclarationNode, ReturnStatementNode, FunctionCallNode,
} from "../../parser/AST/ast";
import { NullVal, NumberVal, RuntimeVal, StringVal, BoolVal, FunctionVal } from "./values";
import { BreakStatementException } from "../exception/BreakStatementException";
import { ContinueStatementException } from "../exception/ContinueStatementException";

/**
 * @class Environment
 * @description This class represents the environment for variable scoping.
 * It maintains a mapping of variable names to their values and supports nested environments.
 * @property {Object} variables - A mapping of variable names to their values.
 * @property {string[]} outputs - An array to store output strings.
 * @constructor
 * @param {Environment | null} parent - The parent environment for scope resolution.
 * @throws {Error} - If a variable is accessed that is not defined in the environment.
 * 
 */
export class Environment {
    private parent: Environment | null;
    private variables: { [key: string]: RuntimeVal };
    public outputs: string[] = [];

    constructor(parent: Environment | null = null) {
        this.parent = parent;
        this.variables = {};
    }

    define(name: string, value: RuntimeVal): void {
        this.variables[name] = value;
    }

    assign(name: string, value: RuntimeVal): void {
        if (name in this.variables) {
            this.variables[name] = value;
        } else if (this.parent) {
            this.parent.assign(name, value);
        } else {
            throw new Error(`Variable '${name}' defined bhako chhaina.`);
        }
    }

    lookup(name: string): RuntimeVal {
        if (name in this.variables) {
            return this.variables[name];
        } else if (this.parent) {
            return this.parent.lookup(name);
        } else {
            throw new Error(`Variable '${name}' defined bhako chhaina.`);
        }
    }

    addOutput(output: string): void {
        this.outputs.push(output);
    }
}

let globalEnv: Environment;

/**
 * @function resetGlobalEnvironment
 * @description Resets the global environment to a new instance of the Environment class.
 * This is useful for clearing the state between different runs of the interpreter.
 */
export function resetGlobalEnvironment() {
    globalEnv = new Environment();
}

/**
 * @function eval_program
 * @param program - The program node to be evaluated.
 * @returns - { results: RuntimeVal, outputs: any[] } - The result of the evaluation and the outputs generated.
 * @description This function evaluates the program node and returns the results and outputs.
 * It iterates through the body of the program and evaluates each statement.
 * It also maintains the global environment for variable scoping.
 * @throws {Error} - If an error occurs during evaluation.
 */
export function eval_program(program: ProgramNode): { results: RuntimeVal; outputs: any[] } {
    const globalEnv = new Environment(); 
    let lastEvaluated: RuntimeVal = { type: "null", value: null } as NullVal;
    for (const statement of program.body) {
        lastEvaluated = evaluate(statement, globalEnv);
    }
    return { results: lastEvaluated, outputs: globalEnv.outputs };
}


/**
 * @function eval_variable_declaration
 * @param node - The variable declaration node to be evaluated.
 * @param env - The environment in which the variable is declared.
 * @returns - { value: RuntimeVal } - The value of the variable after evaluation.
 */
function eval_variable_declaration(node: VariableDeclarationNode, env: Environment): RuntimeVal {
    const value = evaluate(node.init, env);
    env.define(node.identifier.name, value);
    return value;
}

/**
 * @function eval_assignment
 * @param node - The assignment node to be evaluated.
 * @param env - The environment in which the assignment is made.
 * @description This function evaluates the assignment node and assigns the value to the variable in the environment.
 * It also checks if the variable is declared in the environment.
 * @returns - { value: RuntimeVal } - The value assigned to the variable.
 */
function eval_assignment(node: AssignmentNode, env: Environment): RuntimeVal {
    const value = evaluate(node.value, env);
    env.assign(node.identifier.name, value);
    return value;
}

/**
 * @function eval_binary_expr   
 * @param node - The binary expression node to be evaluated.
 * @param env - The environment in which the binary expression is evaluated.
 * @description This function evaluates the binary expression node and returns the result.
 * It supports various operators such as +, -, *, /, %, <, >, <=, >=, ==, !=.
 * It also handles type checking for numbers and strings.
 * @throws {Error} - If an unsupported operator is encountered or if the operands are not of the correct type.
 * @throws {Error} - If division by zero is attempted.
 * @returns - { value: RuntimeVal } - The result of the binary expression evaluation.
 */
function eval_binary_expr(node: BinaryExpressionNode, env: Environment): RuntimeVal {
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
                } else {
                    throw new Error("Zero dekhi division garna manaai chha!.");
                }
            case "%":
                if (right.value !== 0) {
                    return { type: "number", value: left.value % right.value };
                } else {
                    throw new Error("Zero dekhi division garna manaai chha!.");
                }
            case "<":
                return { type: "boolean", value: left.value < right.value } as BoolVal;
            case ">":
                return { type: "boolean", value: left.value > right.value } as BoolVal;
            case "<=":
                return { type: "boolean", value: left.value <= right.value } as BoolVal;
            case ">=":
                return { type: "boolean", value: left.value >= right.value } as BoolVal;
            case "==":
                return { type: "boolean", value: left.value === right.value } as BoolVal;
            case "!=":
                return { type: "boolean", value: left.value !== right.value } as BoolVal;
            default:
                throw new Error(`Unsupported operator: ${node.operator}`);
        }
    } else if (left.type === "string" || right.type === "string") {
        switch (node.operator) {
            case "+":
                return { type: "string", value: left.value.toString() + right.value.toString() } as StringVal;
            case "==":
                return { type: "boolean", value: left.value === right.value } as BoolVal;
            default:
                throw new Error(`Unsupported operator for strings: ${node.operator}`);
        }
    } else {
        throw new Error("Operands chai ki numbers athaba strings hunu parchha.");
    }
}

/**
 * @function eval_identifier
 * @param node - The identifier node to be evaluated.
 * @param env - The environment in which the identifier is evaluated.
 * @description This function evaluates the identifier node and returns the value of the variable in the environment.
 * It also checks if the variable is declared in the environment.
 * @throws {Error} - If the variable is not declared in the environment.
 * @returns - { value: RuntimeVal } - The value of the identifier.
 */
function eval_identifier(node: IdentifierNode, env: Environment): RuntimeVal {
    return env.lookup(node.name);
}

/**
 * @function eval_numeric_literal
 * @param node - The numeric literal node to be evaluated.
 * @returns - { value: RuntimeVal } - The numeric value of the literal.
 */
function eval_numeric_literal(node: NumericLiteralNode): RuntimeVal {
    return { type: "number", value: node.value };
}

/**
 * @function eval_string_literal
 * @param node - The string literal node to be evaluated.
 * @returns - { value: RuntimeVal } - The string value of the literal.
 */
function eval_string_literal(node: StringNode): RuntimeVal {
    return { type: "string", value: node.value };
}

/**
 * @function eval_print
 * @param node - The print node to be evaluated.
 * @param env - The environment in which the print statement is executed.
 * @description This function evaluates the print node and returns the result.
 * It converts the value to a string and adds it to the output array in the environment.
 * @throws {Error} - If the value type is not supported for printing.
 * @returns - { value: RuntimeVal } - The value of the print statement.
 */
function eval_print(node: PrintNode, env: Environment): RuntimeVal {
    const value = evaluate(node.value, env);

    let result = "";

    if (value.type === "string") {
        result = value.value;
    } else if (value.type === "number" || value.type === "boolean") {
        result = value.value.toString();
    } else {
        throw new Error(`Unsupported value type print ko laagi: ${value.type}`);
    }

    env.addOutput(result);
    return value;
}

/**
 * @function eval_increment
 * @param node - The increment node to be evaluated.
 * @param env - The environment in which the increment is made.
 * @description This function evaluates the increment node and increments the value of the variable in the environment.
 * It also checks if the variable is declared in the environment and if it is a number.
 * @throws {Error} - If the variable is not declared or if it is not a number.
 * @returns - { value: RuntimeVal } - The new value of the variable after incrementing.
 */
function eval_increment(node: IncrementNode, env: Environment): RuntimeVal {
    const variable = env.lookup(node.identifier.name);
    if (variable.type !== "number") {
        throw new Error(`Variable '${node.identifier.name}' number haina!.`);
    }
    const newValue = { type: "number", value: variable.value + 1 } as NumberVal;
    env.assign(node.identifier.name, newValue);
    return newValue;
}

/**
 * @function eval_if_statement
 * @param node - The if statement node to be evaluated.
 * @param env - The environment in which the if statement is executed.
 * @description This function evaluates the if statement node and returns the result.
 * It checks the test expression and executes the consequent or alternate block based on the test result.
 * @throws {Error} - If the test expression is not a boolean or if an error occurs during evaluation.
 * @returns - { value: RuntimeVal } - The result of the last evaluated statement in the if statement.
 */
function eval_if_statement(node: IfStatementNode, env: Environment): RuntimeVal {
    const test = evaluate(node.test, env);
    if (test.type !== "boolean") {
        throw new Error("If statement test expression boolean hunai parchha!");
    }

    if (test.value) {
        return eval_block_statement(node.consequent, env);
    } else if (node.alternate) {
        return evaluate(node.alternate, env);
    }

    return { type: "null", value: null } as NullVal;
}

/**
 * @function eval_block_statement
 * @param node - The block statement node to be evaluated.
 * @param env - The environment in which the block statement is executed.
 * @description This function evaluates the block statement node and returns the result.
 * It creates a new environment for the block and evaluates each statement in the block.
 * @returns - { value: RuntimeVal } - The result of the last evaluated statement in the block.
 */
function eval_block_statement(node: BlockStatementNode, env: Environment): RuntimeVal {
    const blockEnv = new Environment(env);
    let lastEvaluated: RuntimeVal = { type: "null", value: null } as NullVal;
    for (const statement of node.body) {
        lastEvaluated = evaluate(statement, blockEnv);
    }
    env.outputs.push(...blockEnv.outputs);
    return lastEvaluated;
}

/**
 * @function eval_boolean_literal
 * @param node - The boolean literal node to be evaluated.
 * @returns - { value: RuntimeVal } - The boolean value of the literal.
 */
function eval_boolean_literal(node: BooleanLiteralNode): RuntimeVal {
    return { type: "boolean", value: node.value } as BoolVal;
}

/**
 * @function eval_while_statement
 * @param node - The while statement node to be evaluated.
 * @param env - The environment in which the while statement is executed.
 * @description This function evaluates the while statement node and returns the result.
 * It checks the test expression and executes the body of the while loop until the test expression is false.
 * It also handles break and continue statements within the loop.
 * @throws {Error} - If the test expression is not a boolean or if an error occurs during evaluation.
 * @returns - { value: RuntimeVal } - The result of the last evaluated statement in the while loop.
 */
function eval_while_statement(node: WhileStatementNode, env: Environment): RuntimeVal {
    let lastEvaluated: RuntimeVal = { type: "null", value: null } as NullVal;

    while (true) {
        const testResult = evaluate(node.test, env);
        if (testResult.type !== "boolean") {
            throw new Error("While statement test expression boolean hunai parchha!");
        }

        if (!testResult.value) {
            break;
        }

        try {
            lastEvaluated = eval_block_statement(node.body, env);
        } catch (e) {
            if (e instanceof BreakStatementException) {
                break;
            } else if (e instanceof ContinueStatementException) {
                continue;
            } else {
                throw e;
            }
        }
    }

    return lastEvaluated;
}

/**
 * @function eval_function_declaration
 * @param node - The function declaration node to be evaluated.
 * @param env - The environment in which the function is declared.
 * @description This function evaluates the function declaration node and returns the result.
 * It defines the function in the environment and creates a new function value.
 * @returns - { value: RuntimeVal } - The function value after evaluation.
 */
function eval_function_declaration(node: FunctionDeclarationNode, env: Environment): RuntimeVal {
    const funcValue: FunctionVal = {
        type: "function",
        value: {
            params: node.params.map((param: IdentifierNode) => param.name),
            body: node.body,
            env: env,
        },
    };
    env.define(node.name.name, funcValue);
    return funcValue;
}

/**
 * @function eval_return_statement
 * @param node - The return statement node to be evaluated.
 * @param env - The environment in which the return statement is executed.
 * @description This function evaluates the return statement node and returns the result.
 * It checks if the argument is present and evaluates it, otherwise returns null.
 * @returns - { value: RuntimeVal } - The result of the return statement evaluation.
 */
function eval_return_statement(node: ReturnStatementNode, env: Environment): RuntimeVal {
    if (node.argument) {
        return evaluate(node.argument, env);
    } else {
        return { type: "null", value: null } as NullVal;
    }
}

/**
 * @function eval_function_call
 * @param node - The function call node to be evaluated.
 * @param env - The environment in which the function is called.
 * @description This function evaluates the function call node and returns the result.
 * It looks up the function in the environment and creates a new environment for the function execution.
 * It also handles the arguments passed to the function.
 * @throws {Error} - If the function is not defined or if there is a mismatch in the number of arguments.
 * @returns - { value: RuntimeVal } - The result of the function call evaluation.
 */
function eval_function_call(node: FunctionCallNode, env: Environment): RuntimeVal {
    const func = env.lookup(node.callee.name);
    if (func.type !== "function") {
        throw new Error(`${node.callee.name} chai function haina!.`);
    }

    const functionEnv = new Environment(func.value.env);
    for (let i = 0; i < func.value.params.length; i++) {
        const paramName = func.value.params[i];
        const argValue = evaluate(node.args[i], env);
        functionEnv.define(paramName, argValue);
    }

    let result: RuntimeVal = { type: "null", value: null } as NullVal;
    try {
        result = evaluate(func.value.body, functionEnv);
    } catch (e) {
        throw e;
    }
    env.outputs.push(...functionEnv.outputs);
    return result;
}

/**
 * @function evaluate
 * @param node - The AST node to evaluate.
 * @param env - The environment in which to evaluate the node.
 * @returns {RuntimeVal} - The result of the evaluation.
 * @description This function evaluates the given AST node based on its type.
 * It handles various node types such as Program, VariableDeclaration, Assignment, BinaryExpression, Identifier, NumericLiteral, String, Increment, Print, IfStatement, BlockStatement, BooleanLiteral, WhileStatement, FunctionDeclaration, ReturnStatement, FunctionCall, BreakStatement, and ContinueStatement.
 */
export function evaluate(node: ASTNode, env: Environment): RuntimeVal {
    switch (node.type) {
        case ASTNodeType.Program:
            const { results } = eval_program(node as ProgramNode);
            return results;
        case ASTNodeType.VariableDeclaration:
            return eval_variable_declaration(node as VariableDeclarationNode, env);
        case ASTNodeType.Assignment:
            return eval_assignment(node as AssignmentNode, env);
        case ASTNodeType.BinaryExpression:
            return eval_binary_expr(node as BinaryExpressionNode, env);
        case ASTNodeType.Identifier:
            return eval_identifier(node as IdentifierNode, env);
        case ASTNodeType.NumericLiteral:
            return eval_numeric_literal(node as NumericLiteralNode);
        case ASTNodeType.String:
            return eval_string_literal(node as StringNode);
        case ASTNodeType.Increment:
            return eval_increment(node as IncrementNode, env);
        case ASTNodeType.Print:
            return eval_print(node as PrintNode, env);
        case ASTNodeType.IfStatement:
            return eval_if_statement(node as IfStatementNode, env);
        case ASTNodeType.BlockStatement:
            return eval_block_statement(node as BlockStatementNode, env);
        case ASTNodeType.BooleanLiteral:
            return eval_boolean_literal(node as BooleanLiteralNode);
        case ASTNodeType.WhileStatement:
            return eval_while_statement(node as WhileStatementNode, env);
        case ASTNodeType.FunctionDeclaration:
            return eval_function_declaration(node as FunctionDeclarationNode, env);
        case ASTNodeType.ReturnStatement:
            return eval_return_statement(node as ReturnStatementNode, env);
        case ASTNodeType.FunctionCall:
            return eval_function_call(node as FunctionCallNode, env);
        case ASTNodeType.BreakStatement:
            throw new BreakStatementException();
        case ASTNodeType.ContinueStatement:
            throw new ContinueStatementException();
        default:
            throw new Error(`Unsupported AST node type: ${node.type}`);
    }
}