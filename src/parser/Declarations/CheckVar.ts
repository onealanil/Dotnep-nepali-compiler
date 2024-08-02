import { variableInfo, VariableType } from "../helper/Interfaces";

export function checkVariablesInExpression(
    expression: string,
    declaredVariables: Map<string, variableInfo>,
    reportError: (message: string) => void
): VariableType | null {
    const variables = expression.split(/[\+\-\*\/]/).map(v => v.trim());
    let lastType: VariableType | null = null;

    for (const variable of variables) {
        if (declaredVariables.has(variable)) {
            const varInfo = declaredVariables.get(variable)!;
            if (lastType && lastType !== varInfo.type) {
                reportError(`Type mismatch bhayo: ${lastType} ra ${varInfo.type}, combine garna paedaina!!`);
            }
            lastType = varInfo.type;
        } else if (/^[a-zA-Z]/.test(variable)) {
            lastType = "string";
        } else if (!isNaN(Number(variable))) {
            lastType = "number";
        } else {
            reportError(`Undeclared variable: ${variable}`);
        }
    }

    return lastType;
}
