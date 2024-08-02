import {
    ASTNode, ASTNodeType, ProgramNode, VariableDeclarationNode, BinaryExpressionNode, IdentifierNode,
    NumericLiteralNode, StringNode, PrintNode, AssignmentNode, IncrementNode, IfStatementNode,
    BlockStatementNode, BooleanLiteralNode, WhileStatementNode,
    FunctionDeclarationNode, ReturnStatementNode, FunctionCallNode,
} from "../../parser/AST/ast";
import { NullVal, NumberVal, RuntimeVal, StringVal, BoolVal, FunctionVal } from "./values";
import { BreakStatementException } from "../exception/BreakStatementException";
import { ContinueStatementException } from "../exception/ContinueStatementException";

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

export function resetGlobalEnvironment() {
    globalEnv = new Environment();
}

export function eval_program(program: ProgramNode): { results: RuntimeVal; outputs: any[] } {
    const globalEnv = new Environment(); 
    let lastEvaluated: RuntimeVal = { type: "null", value: null } as NullVal;
    for (const statement of program.body) {
        lastEvaluated = evaluate(statement, globalEnv);
    }
    return { results: lastEvaluated, outputs: globalEnv.outputs };
}


function eval_variable_declaration(node: VariableDeclarationNode, env: Environment): RuntimeVal {
    const value = evaluate(node.init, env);
    env.define(node.identifier.name, value);
    return value;
}

function eval_assignment(node: AssignmentNode, env: Environment): RuntimeVal {
    const value = evaluate(node.value, env);
    env.assign(node.identifier.name, value);
    return value;
}

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

function eval_identifier(node: IdentifierNode, env: Environment): RuntimeVal {
    return env.lookup(node.name);
}

function eval_numeric_literal(node: NumericLiteralNode): RuntimeVal {
    return { type: "number", value: node.value };
}

function eval_string_literal(node: StringNode): RuntimeVal {
    return { type: "string", value: node.value };
}

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

function eval_increment(node: IncrementNode, env: Environment): RuntimeVal {
    const variable = env.lookup(node.identifier.name);
    if (variable.type !== "number") {
        throw new Error(`Variable '${node.identifier.name}' number haina!.`);
    }
    const newValue = { type: "number", value: variable.value + 1 } as NumberVal;
    env.assign(node.identifier.name, newValue);
    return newValue;
}

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

function eval_block_statement(node: BlockStatementNode, env: Environment): RuntimeVal {
    const blockEnv = new Environment(env);
    let lastEvaluated: RuntimeVal = { type: "null", value: null } as NullVal;
    for (const statement of node.body) {
        lastEvaluated = evaluate(statement, blockEnv);
    }
    env.outputs.push(...blockEnv.outputs);
    return lastEvaluated;
}

function eval_boolean_literal(node: BooleanLiteralNode): RuntimeVal {
    return { type: "boolean", value: node.value } as BoolVal;
}

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

function eval_return_statement(node: ReturnStatementNode, env: Environment): RuntimeVal {
    if (node.argument) {
        return evaluate(node.argument, env);
    } else {
        return { type: "null", value: null } as NullVal;
    }
}

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