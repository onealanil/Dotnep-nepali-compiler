/**
 * @file interface.ts
 * @description This file contains the interfaces and types used in the parser.
 * It includes the variableInfo interface which defines the structure of variable information,
 * the VariableType type which defines the possible types of variables,
 * and the ASTNode interface which represents a node in the Abstract Syntax Tree (AST).
 * @exports VariableType, variableInfo
 * 
 */
import { ASTNode } from "../AST/ast";

export type VariableType = "string" | "number" | "boolean";

export interface variableInfo {
    type: VariableType;
    value?: ASTNode | null; 
    scope: "global" | "local";
}
