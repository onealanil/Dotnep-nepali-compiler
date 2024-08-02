import { variableInfo, VariableType } from "../helper/Interfaces";
export declare function checkVariablesInExpression(expression: string, declaredVariables: Map<string, variableInfo>, reportError: (message: string) => void): VariableType | null;
