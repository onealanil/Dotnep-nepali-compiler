import { ASTNode } from "../AST/ast";

export type VariableType = "string" | "number" | "boolean";

export interface variableInfo {
    type: VariableType;
    value?: ASTNode | null; 
    scope: "global" | "local";
}
