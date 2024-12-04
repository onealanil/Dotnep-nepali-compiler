"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkVariablesInExpression = void 0;
function checkVariablesInExpression(expression, declaredVariables, reportError) {
    const variables = expression.split(/[\+\-\*\/]/).map(v => v.trim());
    let lastType = null;
    for (const variable of variables) {
        if (declaredVariables.has(variable)) {
            const varInfo = declaredVariables.get(variable);
            if (lastType && lastType !== varInfo.type) {
                reportError(`Type mismatch bhayo: ${lastType} ra ${varInfo.type}, combine garna paedaina!!`);
            }
            lastType = varInfo.type;
        }
        else if (/^[a-zA-Z]/.test(variable)) {
            lastType = "string";
        }
        else if (!isNaN(Number(variable))) {
            lastType = "number";
        }
        else {
            reportError(`Undeclared variable: ${variable}`);
        }
    }
    return lastType;
}
exports.checkVariablesInExpression = checkVariablesInExpression;
