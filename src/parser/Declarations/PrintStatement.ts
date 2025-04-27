/**
 * @file PrintStatement.ts
 * @description This file contains the function to parse print statements in the language.
 * @includes parsePrintStatement
 * @exports parsePrintStatement
 * @typedef {Object} PrintNode
 * @property {ASTNodeType} type - The type of the AST node.
 * @property {ASTNode} value - The value of the print statement.
 */
import { Token } from "../../lexer/token_type/Token";
import { PrintNode, ASTNodeType, BinaryExpressionNode } from "../AST/ast";
import { variableInfo, VariableType } from "../helper/Interfaces";
import { parseBinaryExpression } from "./ExpressionParser";

/**
 * @function parsePrintStatement
 * @param tokens - The list of tokens to be parsed.
 * @param cursor - The current position in the list of tokens.
 * @param declaredVariables - A map of declared variables for scope resolution.
 * @param reportError - A function to report errors during parsing.
 * @description This function parses a print statement from the list of tokens.
 * It expects the 'nikaal' keyword followed by an expression.
 * It also checks for a semicolon ';' at the end of the statement.
 * If any of these conditions are not met, an error is reported.
 * @returns { printNode: PrintNode, cursor: number } - The parsed print node and the updated cursor position.
 */
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

    /**
     * @function checkVariables
     * @param node - The AST node to check for variable types.
     * @returns - {VariableType | null} - The type of the variable or null if undeclared.
     * @description This function checks the types of variables in the expression.
     * It verifies if the variables are declared and checks for type mismatches.
     * If a variable is undeclared, an error is reported.
     * If a type mismatch occurs, an error is reported.
     */
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
