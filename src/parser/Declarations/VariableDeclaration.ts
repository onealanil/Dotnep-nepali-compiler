import { Token } from "../../lexer/token_type/Token";
import { ASTNode, ASTNodeType, IdentifierNode, VariableDeclarationNode, BooleanLiteralNode } from "../AST/ast";
import { VariableType, variableInfo } from "../helper/Interfaces";
import { parseBinaryExpression } from "./ExpressionParser";
import { parseFunctionCall } from "../Declarations/FunctionCall";

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
