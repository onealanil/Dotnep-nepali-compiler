import { Token } from "../../lexer/token_type/Token";
import { PrintNode, ASTNodeType, BinaryExpressionNode } from "../AST/ast";
import { variableInfo, VariableType } from "../helper/Interfaces";
import { parseBinaryExpression } from "./ExpressionParser";

export function parsePrintStatement(
    tokens: Token[],
    cursor: number,
    declaredVariables: Map<string, variableInfo>,
    reportError: (message: string) => void
): { printNode: PrintNode, cursor: number } {
    const advance = () => tokens[cursor++];
    const peek = () => tokens[cursor];

    advance(); // skip 'nikaal' keyword

    const expressionResult = parseBinaryExpression(tokens, cursor);
    const expressionNode = expressionResult.node;
    cursor = expressionResult.cursor;

    checkVariables(expressionNode);

    function checkVariables(node: any): VariableType | null {
        if (node.type === ASTNodeType.Identifier) {
            const variableName = node.name;
            if (!declaredVariables.has(variableName)) {
                reportError(`'${variableName}', yo ta declare gareko chhaina nii, feri check gara!`);
                return null;
            }
            return declaredVariables.get(variableName)!.type;
        } else if (node.type === ASTNodeType.BinaryExpression) {
            const leftType = checkVariables(node.left);
            const rightType = checkVariables(node.right);

            if (leftType === null || rightType === null) {
                return null;
            }

            
            if (leftType !== rightType) {
                if ((leftType === "number" && rightType === "string") || (leftType === "string" && rightType === "number")) {
                    return "string"; 
                } else {
                    reportError(`Type mismatch bhayo: '${leftType}' ra '${rightType}' combine garna paedaina!!.`);
                    return null;
                }
            } else if (leftType === "number" && (node.operator !== "+" && node.operator !== "-" && node.operator !== "*" && node.operator !== "%" && node.operator !== "/")) {
                reportError(`Invalid operation for '${leftType}': '${node.operator}' not supported.`);
                return null;
            }

            return leftType;
        } else if (node.type === ASTNodeType.NumericLiteral) {
            return "number";
        } else if (node.type === ASTNodeType.String) {
            return "string";
        }

        return null;
    }

    if (peek().type === "SEMICOLON") {
        advance(); // skip ';'
    } else {
        reportError(`Expected ';' after 'nikaal', but found '${peek().type}'.`);
    }

    return {
        printNode: {
            type: ASTNodeType.Print,
            value: expressionNode
        },
        cursor
    };
}
