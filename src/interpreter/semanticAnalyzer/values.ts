/**
 * @file values.ts
 * @description This file contains the interfaces and types for runtime values in the interpreter.
 * @includes RuntimeVal, NullVal, NumberVal, StringVal, BoolVal, FunctionVal
 * @exports RuntimeVal, NullVal, NumberVal, StringVal, BoolVal, FunctionVal
 */
import { BlockStatementNode } from "../../parser/AST/ast";

export type ValueType = "null" | "number" | "string" | "boolean" | "function";

export interface RuntimeVal {
    type: ValueType;
    value: any;
}

export interface NullVal extends RuntimeVal {
    type: "null";
    value: null;
}

export interface NumberVal extends RuntimeVal {
    type: "number";
    value: number;
}

export interface StringVal extends RuntimeVal {
    type: "string";
    value: string;
}

export interface BoolVal extends RuntimeVal {
    type: "boolean";
    value: boolean;
}

export interface FunctionVal extends RuntimeVal {
    type: "function";
    value: {
        params: string[];
        body: BlockStatementNode;
        env: any;
    };
}