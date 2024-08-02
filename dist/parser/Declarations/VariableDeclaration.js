"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseVariableDeclaration = void 0;
const ast_1 = require("../AST/ast");
const ExpressionParser_1 = require("./ExpressionParser");
const FunctionCall_1 = require("../Declarations/FunctionCall");
function parseVariableDeclaration(tokens, cursor, declaredVariables, reportError) {
    var _a, _b, _c;
    let _cursor = cursor;
    const advance = () => tokens[_cursor++];
    const peek = () => tokens[_cursor];
    advance();
    const identifierToken = advance();
    if (identifierToken.type !== "IDENTIFIER") {
        reportError(`Identifier expected after 'rakh', but found '${identifierToken.type}' instead.`);
    }
    const identifier = {
        type: ast_1.ASTNodeType.Identifier,
        name: identifierToken.value,
    };
    let init = {
        type: ast_1.ASTNodeType.NumericLiteral,
        value: 0,
    };
    let varType;
    if (declaredVariables.has(identifier.name)) {
        reportError(`Variable '${identifier.name}' is already declared in this scope.`);
    }
    else {
        const initialType = "number";
        declaredVariables.set(identifier.name, { type: initialType, value: null, scope: "local" });
    }
    if (((_a = peek()) === null || _a === void 0 ? void 0 : _a.type) === "OPERATOR" && peek().value === "=") {
        advance();
        // Check if the next token indicates a function call
        if (peek().type === "IDENTIFIER" && ((_b = tokens[_cursor + 1]) === null || _b === void 0 ? void 0 : _b.type) === "LeftParen") {
            const functionCallResult = (0, FunctionCall_1.parseFunctionCall)(tokens, _cursor, reportError);
            init = functionCallResult.call;
            _cursor = functionCallResult.cursor;
        }
        else {
            const expressionResult = parseExpression(tokens, _cursor);
            init = expressionResult.node;
            _cursor = expressionResult.cursor;
        }
        varType = checkExpressionType(init);
        if (varType !== undefined) {
            declaredVariables.set(identifier.name, { type: varType, value: init, scope: "local" });
        }
    }
    if (((_c = peek()) === null || _c === void 0 ? void 0 : _c.type) === "SEMICOLON") {
        advance();
    }
    const declaration = {
        type: ast_1.ASTNodeType.VariableDeclaration,
        identifier,
        init,
    };
    return { declaration, cursor: _cursor };
    function checkExpressionType(node) {
        if (node.type === ast_1.ASTNodeType.Identifier) {
            const varInfo = declaredVariables.get(node.name);
            if (!varInfo) {
                reportError(`Undeclared variable: '${node.name}' used in expression.`);
                return undefined;
            }
            return varInfo.type;
        }
        else if (node.type === ast_1.ASTNodeType.NumericLiteral) {
            return "number";
        }
        else if (node.type === ast_1.ASTNodeType.String) {
            return "string";
        }
        else if (node.type === ast_1.ASTNodeType.BooleanLiteral) {
            return "boolean";
        }
        else if (node.type === ast_1.ASTNodeType.BinaryExpression) {
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
exports.parseVariableDeclaration = parseVariableDeclaration;
function parseExpression(tokens, cursor) {
    const token = tokens[cursor];
    if (token.type === "BOOLEAN") {
        const booleanNode = {
            type: ast_1.ASTNodeType.BooleanLiteral,
            value: token.value === "sahi" ? true : false,
        };
        return { node: booleanNode, cursor: cursor + 1 };
    }
    return (0, ExpressionParser_1.parseBinaryExpression)(tokens, cursor);
}
