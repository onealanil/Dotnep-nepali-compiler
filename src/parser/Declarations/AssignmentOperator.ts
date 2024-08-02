import { Token } from "../../lexer/token_type/Token";
import { ASTNode, ASTNodeType, IdentifierNode, AssignmentNode, NumericLiteralNode, IncrementNode } from "../AST/ast";
import { variableInfo } from "../helper/Interfaces";

export function parseAssignmentStatement(
    tokens: Token[],
    cursor: number,
    declaredVariables: Map<string, variableInfo>,
    reportError: (message: string) => void
): { assignment: AssignmentNode | IncrementNode; cursor: number } {
    let _cursor = cursor;
    const advance = () => tokens[_cursor++];
    const peek = () => tokens[_cursor];

    const identifierToken = advance();
    if (identifierToken.type !== "IDENTIFIER") {
        reportError(`Identifier expect gareko thiyo assignment ma tara, ${identifierToken.type} yo bhetiyo`);
    }

    const identifier: IdentifierNode = {
        type: ASTNodeType.Identifier,
        name: identifierToken.value,
    };

    if (!declaredVariables.has(identifier.name)) {
        reportError(`Variable ${identifier.name} undeclared`);
    }

    if (peek().type === "OPERATOR" && peek().value === "=") {
        advance(); // skip '='

        const result = parseExpression(tokens, _cursor, declaredVariables, reportError);
        const value = result.node;
        _cursor = result.cursor;

        if (peek().type === "SEMICOLON") {
            advance(); // skip ';'
        } else {
            reportError(`';' yo expect gareko thiyo tara ${peek().type} yo bhetiyo`);
        }

        const assignment: AssignmentNode = {
            type: ASTNodeType.Assignment,
            identifier,
            value,
        };
        const varInfo = declaredVariables.get(identifier.name);
        if (varInfo) {
            varInfo.value = value;
        }

        return { assignment, cursor: _cursor };
    } else if (peek().type === "OPERATOR" && peek().value === "++") {
        advance(); // skip '++'

        if (peek().type === "SEMICOLON") {
            advance(); // skip ';'
        } else {
            reportError(`';' expect gareko thiyo tara ${peek().type} yo bhetiyo`);
        }

        const increment: IncrementNode = {
            type: ASTNodeType.Increment,
            identifier,
        };
        const varInfo = declaredVariables.get(identifier.name);
        if (varInfo && varInfo.value && varInfo.value.type === ASTNodeType.NumericLiteral) {
            varInfo.value = { type: ASTNodeType.NumericLiteral, value: (varInfo.value as NumericLiteralNode).value + 1 };
        }

        return { assignment: increment, cursor: _cursor };
    } else {
        reportError(`'=' athaba'++' expect gareko thiyo assignment ma tara ${peek().type} yo bhetiyo`);
    }

    const assignment: AssignmentNode = {
        type: ASTNodeType.Assignment,
        identifier,
        value: {
            type: ASTNodeType.NumericLiteral,
            value: 0
        }
    };

    return { assignment, cursor: _cursor };
}

function parseExpression(tokens: Token[], cursor: number, declaredVariables: Map<string, variableInfo>, reportError: (message: string) => void): { node: ASTNode, cursor: number } {
    let _cursor = cursor;
    const advance = () => tokens[_cursor++];
    const peek = () => tokens[_cursor];

    let left = parsePrimary(tokens, _cursor, declaredVariables, reportError);
    _cursor = left.cursor;

    while (peek() && peek().type === "OPERATOR" && ["+", "-", "*", "/", "%"].includes(peek().value)) {
        const operator = advance().value;
        const right = parsePrimary(tokens, _cursor, declaredVariables, reportError);
        _cursor = right.cursor;

        left = {
            node: {
                type: ASTNodeType.BinaryExpression,
                left: left.node,
                operator,
                right: right.node
            },
            cursor: _cursor
        };
    }

    return left;
}

function parsePrimary(tokens: Token[], cursor: number, declaredVariables: Map<string, variableInfo>, reportError: (message: string) => void): { node: ASTNode, cursor: number } {
    const token = tokens[cursor++];

    if (token.type === "NUMBER") {
        return {
            node: {
                type: ASTNodeType.NumericLiteral,
                value: Number(token.value.trim())
            },
            cursor
        };
    }

    if (token.type === "STRING") {
        return {
            node: {
                type: ASTNodeType.String,
                value: token.value.trim()
            },
            cursor
        };
    }

    if (token.type === "IDENTIFIER") {
        return {
            node: {
                type: ASTNodeType.Identifier,
                name: token.value.trim()
            },
            cursor
        };
    }

    reportError(`Unexpected token bhetiyo: ${token.type}`);
    return { node: { type: ASTNodeType.NullType, value: null }, cursor };
}
