"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePrintStatement = void 0;
const ast_1 = require("../AST/ast");
const ExpressionParser_1 = require("./ExpressionParser");
function parsePrintStatement(tokens, cursor, declaredVariables, reportError) {
    const advance = () => tokens[cursor++];
    const peek = () => tokens[cursor];
    advance(); // skip 'nikaal' keyword
    const expressionResult = (0, ExpressionParser_1.parseBinaryExpression)(tokens, cursor);
    const expressionNode = expressionResult.node;
    cursor = expressionResult.cursor;
    // variable use in the expression
    checkVariables(expressionNode);
    function checkVariables(node) {
        if (node.type === ast_1.ASTNodeType.Identifier) {
            const variableName = node.name;
            if (!declaredVariables.has(variableName)) {
                reportError(`'${variableName}', yo ta declare gareko chhaina nii, feri check gara!`);
                return null;
            }
            return declaredVariables.get(variableName).type;
        }
        else if (node.type === ast_1.ASTNodeType.BinaryExpression) {
            const leftType = checkVariables(node.left);
            const rightType = checkVariables(node.right);
            if (leftType === null || rightType === null) {
                return null;
            }
            // Perform type checks for BinaryExpression
            if (leftType !== rightType) {
                if ((leftType === "number" && rightType === "string") || (leftType === "string" && rightType === "number")) {
                    return "string"; // Allow concatenation of string and number
                }
                else {
                    reportError(`Type mismatch bhayo: '${leftType}' ra '${rightType}' combine garna paedaina!!.`);
                    return null;
                }
            }
            else if (leftType === "number" && (node.operator !== "+" && node.operator !== "-" && node.operator !== "*" && node.operator !== "%" && node.operator !== "/")) {
                reportError(`Invalid operation for '${leftType}': '${node.operator}' not supported.`);
                return null;
            }
            return leftType;
        }
        else if (node.type === ast_1.ASTNodeType.NumericLiteral) {
            return "number";
        }
        else if (node.type === ast_1.ASTNodeType.String) {
            return "string";
        }
        return null;
    }
    if (peek().type === "SEMICOLON") {
        advance(); // skip ';'
    }
    else {
        reportError(`Expected ';' after 'nikaal', but found '${peek().type}'.`);
    }
    return {
        printNode: {
            type: ast_1.ASTNodeType.Print,
            value: expressionNode
        },
        cursor
    };
}
exports.parsePrintStatement = parsePrintStatement;
