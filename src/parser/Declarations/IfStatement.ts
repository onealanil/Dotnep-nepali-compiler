import { Token } from "../../lexer/token_type/Token";
import { ASTNodeType, IfStatementNode, BlockStatementNode, BinaryExpressionNode, NumericLiteralNode, BooleanLiteralNode, IdentifierNode, ASTNode, StringNode, BreakStatementNode, ContinueStatementNode } from "../AST/ast";
import { CustomError } from "../errors/CustomErrors";
import { variableInfo } from "../helper/Interfaces";
import { parseAssignmentStatement } from "./AssignmentOperator";
import { parsePrintStatement } from "./PrintStatement";
import { parseVariableDeclaration } from "./VariableDeclaration";

export function parseIfStatement(
    tokens: Token[],
    cursor: number,
    declaredVariables: Map<string, variableInfo>,
    reportError: (message: string) => void
): { ifStatement: IfStatementNode, cursor: number } {
    let _cursor = cursor;

    function advance(): Token {
        return tokens[_cursor++];
    }

    function peek(): Token {
        return tokens[_cursor];
    }

    function match(...types: string[]): boolean {
        if (_cursor >= tokens.length) return false;
        return types.includes(peek().type);
    }

    function parseExpression(precedence = 0): ASTNode {
        let left = parsePrimaryExpression();

        while (match("OPERATOR") && getPrecedence(peek().value) > precedence) {
            const operator = advance().value;
            const right = parseExpression(getPrecedence(operator));
            left = {
                type: ASTNodeType.BinaryExpression,
                operator,
                left,
                right,
            } as BinaryExpressionNode;
        }

        return left;
    }

    function getPrecedence(operator: string): number {
        switch (operator) {
            case "==":
            case "!=":
                return 1;
            case "<":
            case "<=":
            case ">":
            case ">=":
                return 2;
            case "+":
            case "-":
                return 3;
            case "*":
            case "/":
            case "%":
                return 4;
            default:
                return 0;
        }
    }

    function parsePrimaryExpression(): ASTNode {
        const token = peek();

        if (token.type === "NUMBER") {
            advance();
            return {
                type: ASTNodeType.NumericLiteral,
                value: parseFloat(token.value),
            } as NumericLiteralNode;
        }

        if (token.type === "BOOLEAN") {
            advance();
            return {
                type: ASTNodeType.BooleanLiteral,
                value: token.value === "sahi",
            } as BooleanLiteralNode;
        }

        if (token.type === "STRING") {
            advance();
            return {
                type: ASTNodeType.String,
                value: token.value,
            } as StringNode;
        }

        if (token.type === "IDENTIFIER") {
            advance();
            return {
                type: ASTNodeType.Identifier,
                name: token.value,
            } as IdentifierNode;
        }

        if (token.type === "LeftParen") {
            advance(); // Skip '('
            const expression = parseExpression();
            if (!match("RightParen")) {
                throw new CustomError(`')' expect gareko thiyo tara: ${peek().value} yo bhetiyo.`);
            }
            advance(); // Skip ')'
            return expression;
        }

        throw new CustomError(`Unexpected token: ${token.value}`);
    }

    function parseBlockStatement(): BlockStatementNode {
        const body: ASTNode[] = [];

        while (!match("RightBrace") && _cursor < tokens.length) {
            const token = peek();

            if (token.type === "KEYWORD" && token.value === "rakh") {
                const result = parseVariableDeclaration(tokens, _cursor, declaredVariables, reportError);
                _cursor = result.cursor;
                body.push(result.declaration);
            } else if (token.type === "PRINT" && token.value === "nikaal") {
                const result = parsePrintStatement(tokens, _cursor, declaredVariables, reportError);
                _cursor = result.cursor;
                body.push(result.printNode);
            } else if (token.type === "IDENTIFIER") {
                const result = parseAssignmentStatement(tokens, _cursor, declaredVariables, reportError);
                _cursor = result.cursor;
                if (result.assignment) {
                    body.push(result.assignment);
                }
            } else if (token.type === "IF" && token.value === "yedi") {
                const result = parseIfStatement(tokens, _cursor, declaredVariables, reportError);
                _cursor = result.cursor;
                body.push(result.ifStatement);
            } else if (token.type === "BREAK" && token.value === "bhayo") {
                const breakNode: BreakStatementNode = {
                    type: ASTNodeType.BreakStatement,
                };
                body.push(breakNode);
                _cursor++; // Move past 'bhayo'
                if (!match("SEMICOLON")) {
                    throw new CustomError(`';' expect gareko thiyo tara: ${peek().value} yo bhetiyo.`);
                }
                _cursor++; // Move past ';'
            } else if (token.type === "CONTINUE" && token.value === "jaari rakh") {
                const continueNode: ContinueStatementNode = {
                    type: ASTNodeType.ContinueStatement,
                };
                body.push(continueNode);
                _cursor++; // Move past 'jaari rakh'
                if (!match("SEMICOLON")) {
                    throw new CustomError(`';' expect gareko thiyo tara: ${peek().value} yo bhetiyo.`);
                }
                _cursor++; // Move past ';'
            } else {
                console.log(`Unexpected token: ${token.value} (type: ${token.type}) at position ${_cursor}`);
                reportError(`Unexpected token: ${token.value} at position ${_cursor}`);
                advance();
            }
        }

        if (!match("RightBrace")) {
            throw new CustomError(`'}' expect gareko thiyo tara: ${peek().value} yo bhetiyo.`);
        }

        advance(); // Skip '}'

        return {
            type: ASTNodeType.BlockStatement,
            body,
        };
    }

    advance(); // Skip 'yedi'

    if (!match("LeftParen")) {
        throw new CustomError(`'(' expect gareko thiyo tara: ${peek().value} yo bhetiyo.`);
    }

    advance(); // Skip '('

    const test = parseExpression(); 
    if (!match("RightParen")) {
        throw new CustomError(`')' expect gareko thiyo tara: ${peek().value} yo bhetiyo.`);
    }

    advance(); // Skip ')'

    if (!match("LeftBrace")) {
        throw new CustomError(`'{' expect gareko thiyo tara: ${peek().value} yo bhetiyo.`);
    }

    advance(); // Skip '{'
    const consequent = parseBlockStatement();

    let alternate: IfStatementNode | BlockStatementNode | undefined;

    if (match("ELSEIF", "navaye")) {
        const elseIfStatements: IfStatementNode[] = [];
        while (match("ELSEIF", "navaye")) {
            advance(); // Skip 'navaye'

            if (!match("LeftParen")) {
                throw new CustomError(`'(' expect gareko thiyo tara: ${peek().value} yo bhetiyo.`);
            }

            advance(); // Skip '('
            const elseIfTest = parseExpression();

            if (!match("RightParen")) {
                throw new CustomError(`')' expect gareko thiyo tara: ${peek().value} yo bhetiyo.`);
            }

            advance(); // Skip ')'

            if (!match("LeftBrace")) {
                throw new CustomError(`'{' expect gareko thiyo tara: ${peek().value} yo bhetiyo.`);
            }

            advance(); // Skip '{'
            const elseIfConsequent = parseBlockStatement();

            elseIfStatements.push({
                type: ASTNodeType.IfStatement,
                test: elseIfTest as BinaryExpressionNode,
                consequent: elseIfConsequent,
                alternate: undefined,
            } as IfStatementNode);
        }

        if (match("ELSE", "haina bhane")) {
            advance(); // Skip 'haina bhane'

            if (!match("LeftBrace")) {
                throw new CustomError(`'{' expect gareko thiyo tara: ${peek().value} yo bhetiyo.`);
            }

            advance(); // Skip '{'
            const elseConsequent = parseBlockStatement();

            let lastElseIf = elseIfStatements.pop();
            lastElseIf!.alternate = elseConsequent;

            while (elseIfStatements.length > 0) {
                const nextElseIf = elseIfStatements.pop();
                nextElseIf!.alternate = lastElseIf;
                lastElseIf = nextElseIf;
            }

            alternate = lastElseIf;
        } else {
            // Nest the else if statements
            let lastElseIf = elseIfStatements.pop();

            while (elseIfStatements.length > 0) {
                const nextElseIf = elseIfStatements.pop();
                nextElseIf!.alternate = lastElseIf;
                lastElseIf = nextElseIf;
            }

            alternate = lastElseIf;
        }
    } else if (match("ELSE", "haina bhane")) {
        advance(); // Skip 'haina bhane'

        if (!match("LeftBrace")) {
            throw new CustomError(` '{' expect gareko thiyo tara: ${peek().value} yo bhetiyo.`);
        }

        advance(); // Skip '{'
        alternate = parseBlockStatement();
    }

    return {
        ifStatement: {
            type: ASTNodeType.IfStatement,
            test: test as BinaryExpressionNode,
            consequent,
            alternate,
        },
        cursor: _cursor,
    };
}
