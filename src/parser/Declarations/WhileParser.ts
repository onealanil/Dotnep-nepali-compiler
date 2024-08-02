import { Token } from "../../lexer/token_type/Token";
import { ASTNode, ASTNodeType, WhileStatementNode, BlockStatementNode, BreakStatementNode, ContinueStatementNode } from "../AST/ast";
import { variableInfo } from "../helper/Interfaces";
import { CustomError } from "../errors/CustomErrors";
import { parseVariableDeclaration } from "./VariableDeclaration";
import { parsePrintStatement } from "./PrintStatement";
import { parseAssignmentStatement } from "./AssignmentOperator";
import { parseIfStatement } from "./IfStatement";
import { parseBinaryExpression } from "./ExpressionParser";

export function parseWhileStatement(
    tokens: Token[],
    cursor: number,
    declaredVariables: Map<string, variableInfo>,
    reportError: (message: string) => void
): { whileStatement: WhileStatementNode, cursor: number } {
    let current = cursor;

    if (tokens[current].type !== "WHILE" || tokens[current].value !== "jaba samma") {
        reportError(`Expected 'jaba samma' tara ${tokens[current].value} yo bhetiyo.`);
        throw new CustomError(`Parsing failed: Expected 'jaba samma' tara ${tokens[current].value} yo bhetiyo.`);
    }
    current++;

    // Check for '('
    if (tokens[current].type !== "LeftParen") {
        reportError(`Expected '(' tara ${tokens[current].value} yo bhetiyo.`);
        throw new CustomError(`Parsing failed: Expected '(' tara ${tokens[current].value} yo bhetiyo.`);
    }
    current++; // Move past '('

      let condition;
      if (tokens[current].type === "BOOLEAN") {
          condition = {
              node: { 
                  type: ASTNodeType.BooleanLiteral, 
                  value: tokens[current].value === "sahi" 
              },
              cursor: current + 1
          };
      } else {
          condition = parseBinaryExpression(tokens, current);
      }
      current = condition.cursor;

    // // Parse the condition expression
    // const condition = parseBinaryExpression(tokens, current);
    // current = condition.cursor;

    // Check for ')'
    if (tokens[current].type !== "RightParen") {
        reportError(`Expected ')' tara ${tokens[current].value} yo bhetiyo.`);
        throw new CustomError(`Parsing failed: Expected ')' tara ${tokens[current].value} yo bhetiyo.`);
    }
    current++; // Move past ')'

    const body = parseWhileLoopBody(tokens, current, declaredVariables, reportError);
    current = body.cursor;

    const whileStatement: WhileStatementNode = {
        type: ASTNodeType.WhileStatement,
        test: condition.node,
        body: body.blockStatement,
    };

    return { whileStatement, cursor: current };
}

function parseWhileLoopBody(
    tokens: Token[],
    cursor: number,
    declaredVariables: Map<string, variableInfo>,
    reportError: (message: string) => void
): { blockStatement: BlockStatementNode, cursor: number } {
    let current = cursor;
    const blockBody: ASTNode[] = [];

    // Check for '{'
    if (tokens[current].type !== "LeftBrace") {
        reportError(`Expected '{' tara ${tokens[current].value} yo bhetiyo.`);
        throw new CustomError(`Parsing failed: Expected '{' tara ${tokens[current].value} yo bhetiyo.`);
    }
    current++; // Move past '{'

    while (tokens[current].type !== "RightBrace" && current < tokens.length) {
        const token = tokens[current];
        switch (token.type) {
            case "KEYWORD": {
                if (token.value === "rakh") {
                    const { declaration, cursor: newCursor } = parseVariableDeclaration(tokens, current, declaredVariables, reportError);
                    blockBody.push(declaration);
                    current = newCursor;
                } else {
                    reportError(`Unexpected keyword bhetiyo '${token.value}' at position ${current}`);
                    throw new CustomError(`Parsing failed: Unexpected keyword bhetiyo '${token.value}' at position ${current}`);
                }
                break;
            }
            case "PRINT": {
                if (token.value === "nikaal") {
                    const { printNode, cursor: newCursor } = parsePrintStatement(tokens, current, declaredVariables, reportError);
                    blockBody.push(printNode);
                    current = newCursor;
                } else {
                    reportError(`Unexpected keyword bhetiyo '${token.value}' at position ${current}`);
                    throw new CustomError(`Parsing failed: Unexpected keyword bhetiyo '${token.value}' at position ${current}`);
                }
                break;
            }
            case "IDENTIFIER": {
                const nextToken = tokens[current + 1];
                if (nextToken && nextToken.type === "OPERATOR") {
                    const { assignment, cursor: newCursor } = parseAssignmentStatement(tokens, current, declaredVariables, reportError);
                    if (assignment) {
                        blockBody.push(assignment);
                    }
                    current = newCursor;
                } else {
                    reportError(`Unexpected identifier bhetiyo '${token.value}' at position ${current}`);
                    throw new CustomError(`Parsing failed: Unexpected identifier bhetiyo '${token.value}' at position ${current}`);
                }
                break;
            }
            case "IF": {
                const { ifStatement, cursor: newCursor1 } = parseIfStatement(tokens, current, declaredVariables, reportError);
                blockBody.push(ifStatement);
                current = newCursor1;
                break;
            }
            case "WHILE": {
                const { whileStatement, cursor: newCursor2 } = parseWhileStatement(tokens, current, declaredVariables, reportError);
                blockBody.push(whileStatement);
                current = newCursor2;
                break;
            }
            case "BREAK": {
                if (token.value === "bhayo") {
                    const breakNode: BreakStatementNode = {
                        type: ASTNodeType.BreakStatement,
                    };
                    blockBody.push(breakNode);
                    current++; // Move past 'bhayo'
                } else {
                    reportError(`Unexpected keyword bhetiyo '${token.value}' at position ${current}`);
                    throw new CustomError(`Parsing failed: Unexpected keyword bhetiyo '${token.value}' at position ${current}`);
                }
                break;
            }
            case "CONTINUE": {
                if (token.value === "jaari rakh") {
                    const continueNode: ContinueStatementNode = {
                        type: ASTNodeType.ContinueStatement,
                    };
                    blockBody.push(continueNode);
                    current++; // Move past 'jaari rakh'
                } else {
                    reportError(`Unexpected keyword bhetiyo '${token.value}' at position ${current}`);
                    throw new CustomError(`Parsing failed: Unexpected keyword bhetiyo '${token.value}' at position ${current}`);
                }
                break;
            }
            default: {
                reportError(`Unexpected token bhetiyo '${token.value}' at position ${current}`);
                throw new CustomError(`Parsing failed: Unexpected token bhetiyo'${token.value}' at position ${current}`);
            }
        }

        if (tokens[current].type === "SEMICOLON") {
            current++;
        }
    }

    // Check for '}'
    if (tokens[current].type !== "RightBrace") {
        reportError(`Expected '}' tara ${tokens[current].value} yo bhetiyo.`);
        throw new CustomError(`Parsing failed: Expected '}' tara ${tokens[current].value} yo bhetiyo.`);
    }
    current++; // Move past '}'

    const blockStatement: BlockStatementNode = {
        type: ASTNodeType.BlockStatement,
        body: blockBody,
    };

    return { blockStatement, cursor: current };
}
