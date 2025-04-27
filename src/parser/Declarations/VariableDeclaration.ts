/**
 * @file VariableDeclaration.ts
 * @description This file contains the function to parse variable declaration statements in the language.
 * @includes parseVariableDeclaration
 * @exports parseVariableDeclaration
 * @exports parseExpression
 */
import { Token } from "../../lexer/token_type/Token";
import { ASTNode, ASTNodeType, IdentifierNode, VariableDeclarationNode, BooleanLiteralNode } from "../AST/ast";
import { VariableType, variableInfo } from "../helper/Interfaces";
import { parseBinaryExpression } from "./ExpressionParser";
import { parseFunctionCall } from "../Declarations/FunctionCall";

/**
 * @function parseVariableDeclaration
 * @param tokens - The list of tokens to be parsed.
 * @param cursor - The current position in the list of tokens.
 * @param declaredVariables - A map of declared variables for scope resolution.
 * @param reportError - A function to report errors during parsing.
 * @description This function parses a variable declaration from the list of tokens.
 * It expects the 'rakh' keyword followed by an identifier.
 * It also checks for an optional assignment operator '=' and an expression.
 * It also checks for a semicolon ';' at the end of the statement.
 * If any of these conditions are not met, an error is reported.
 * @returns { declaration: VariableDeclarationNode; cursor: number } - The parsed variable declaration and the updated cursor position.
 */
export function parseVariableDeclaration(
    tokens: Token[],
    cursor: number,
    declaredVariables: Map<string, variableInfo>,
    reportError: (message: string) => void
): { declaration: VariableDeclarationNode; cursor: number } {
    let _cursor = cursor;
    const advance = () => tokens[_cursor++];
    const peek = () => tokens[_cursor];

    advance();

    const identifierToken = advance();
    if (identifierToken.type !== "IDENTIFIER") {
        reportError(`Identifier expected after 'rakh', but found '${identifierToken.type}' instead.`);
    }

    const identifier: IdentifierNode = {
        type: ASTNodeType.Identifier,
        name: identifierToken.value,
    };

    let init: ASTNode = {
        type: ASTNodeType.NumericLiteral,
        value: 0,
    };

    let varType: VariableType | undefined;
    if (declaredVariables.has(identifier.name)) {
        reportError(`Variable '${identifier.name}' is already declared in this scope.`);
    } else {
        const initialType: VariableType = "number";
        declaredVariables.set(identifier.name, { type: initialType, value: null, scope: "local" });
    }

    if (peek()?.type === "OPERATOR" && peek().value === "=") {
        advance();
        
        if (peek().type === "IDENTIFIER" && tokens[_cursor + 1]?.type === "LeftParen") {
            const functionCallResult = parseFunctionCall(tokens, _cursor, reportError);
            init = functionCallResult.call;
            _cursor = functionCallResult.cursor;
        } else {
            const expressionResult = parseExpression(tokens, _cursor);
            init = expressionResult.node;
            _cursor = expressionResult.cursor;
        }

        varType = checkExpressionType(init);
        if (varType !== undefined) {
            declaredVariables.set(identifier.name, { type: varType, value: init, scope: "local" });
        }
    }


    if (peek()?.type === "SEMICOLON") {
        advance();
    } 

    const declaration: VariableDeclarationNode = {
        type: ASTNodeType.VariableDeclaration,
        identifier,
        init,
    };

    return { declaration, cursor: _cursor };

    /**
     * @function checkExpressionType
     * @param node - The AST node to check for variable types.
     * @returns {VariableType | undefined} - The type of the variable or undefined if undeclared.
     * @description This function checks the types of variables in the expression.
     * It verifies if the variables are declared and checks for type mismatches.
     * If a variable is undeclared, an error is reported.
     * If a type mismatch occurs, an error is reported.
     */
    function checkExpressionType(node: ASTNode): VariableType | undefined {
        if (node.type === ASTNodeType.Identifier) {
            const varInfo = declaredVariables.get(node.name);
            if (!varInfo) {
                reportError(`Undeclared variable: '${node.name}' used in expression.`);
                return undefined;
            }
            return varInfo.type;
        } else if (node.type === ASTNodeType.NumericLiteral) {
            return "number";
        } else if (node.type === ASTNodeType.String) {
            return "string";
        } else if (node.type === ASTNodeType.BooleanLiteral) {
            return "boolean";
        } else if (node.type === ASTNodeType.BinaryExpression) {
            const leftType = checkExpressionType(node.left);
            const rightType = checkExpressionType(node.right);

            if (leftType !== rightType) {
                reportError(`Type mismatch: Cannot combine '${leftType}' with '${rightType}'.`);
                return undefined;
            }
            return leftType;
        }
        return undefined;
    }
}

/**
 * @function parseExpression
 * @param tokens - The list of tokens to be parsed.
 * @param cursor - The current position in the list of tokens.
 * @description This function parses an expression from the list of tokens.
 * It expects a boolean literal, binary expression, or a function call.
 * It also checks for an optional assignment operator '=' and an expression.
 * If any of these conditions are not met, an error is reported.
 * @throws {Error} - If an unexpected token is encountered.
 * @returns { node: ASTNode, cursor: number } - The parsed AST node and the updated cursor position.
 */
function parseExpression(tokens: Token[], cursor: number): { node: ASTNode, cursor: number } {
    const token = tokens[cursor];
    if (token.type === "BOOLEAN") {
        const booleanNode: BooleanLiteralNode = {
            type: ASTNodeType.BooleanLiteral,
            value: token.value === "sahi" ? true : false,
        };
        return { node: booleanNode, cursor: cursor + 1 };
    }
    return parseBinaryExpression(tokens, cursor);
}
