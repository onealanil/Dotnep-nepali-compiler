export enum ASTNodeType {
    Program = "Program",
    VariableDeclaration = "VariableDeclaration",
    BinaryExpression = "BinaryExpression",
    Identifier = "Identifier",
    NumericLiteral = "NumericLiteral",
    Print = "Print",
    String = "String",
    Assignment = "Assignment",
    NullType = "NullType",
    Increment = "Increment",
    IfStatement = "IfStatement",
    BlockStatement = "BlockStatement",
    BooleanLiteral = "BooleanLiteral",
    WhileStatement = "WhileStatement",
    BreakStatement = "BreakStatement",
    ContinueStatement = "ContinueStatement",
    FunctionDeclaration = "FunctionDeclaration",
    FunctionCall = "FunctionCall",
    ReturnStatement = "ReturnStatement", 
    AssignmentExpression = "AssignmentExpression",
}

export interface ASTNode {
    type: ASTNodeType;
    [key: string]: any;
}


export interface ProgramNode extends ASTNode {
    type: ASTNodeType.Program;
    body: ASTNode[];
}

export interface VariableDeclarationNode extends ASTNode {
    type: ASTNodeType.VariableDeclaration;
    identifier: IdentifierNode;
    init: ASTNode;
}

export interface BinaryExpressionNode extends ASTNode {
    type: ASTNodeType.BinaryExpression;
    left: ASTNode;
    operator: string;
    right: ASTNode;
}

export interface IdentifierNode extends ASTNode {
    type: ASTNodeType.Identifier;
    name: string;
}

export interface NumericLiteralNode extends ASTNode {
    type: ASTNodeType.NumericLiteral;
    value: number;
}

export interface PrintNode extends ASTNode{
    type: ASTNodeType.Print;
    value: ASTNode;
}

export interface StringNode extends ASTNode{
    type: ASTNodeType.String;
    value: string;
}

export interface AssignmentNode extends ASTNode{
    type: ASTNodeType.Assignment;
    value: ASTNode;
}

export interface NullTypeNode extends ASTNode{
    type: ASTNodeType.NullType;
    value: null;
}
export interface IncrementNode extends ASTNode{
    type: ASTNodeType.Increment;
    identifier: IdentifierNode;
}

export interface IfStatementNode extends ASTNode {
    type: ASTNodeType.IfStatement;  
    test: BinaryExpressionNode;
    consequent: BlockStatementNode;
    alternate?: IfStatementNode |BlockStatementNode | undefined;
}

export interface BlockStatementNode extends ASTNode {
    type: ASTNodeType.BlockStatement;
    body: ASTNode[];
}

export interface BooleanLiteralNode extends ASTNode {
    type: ASTNodeType.BooleanLiteral;
    value: boolean;
}

export interface WhileStatementNode extends ASTNode {
    type: ASTNodeType.WhileStatement;
    test: ASTNode;
    body: BlockStatementNode;
}

export interface BreakStatementNode extends ASTNode {
    type: ASTNodeType.BreakStatement;
}

export interface ContinueStatementNode extends ASTNode {
    type: ASTNodeType.ContinueStatement;
}

//for functions
export interface FunctionDeclarationNode extends ASTNode {
    type: ASTNodeType.FunctionDeclaration;
    name: IdentifierNode;
    params: IdentifierNode[];
    body: BlockStatementNode;
    returns: boolean; 
}

export interface FunctionCallNode extends ASTNode {
    type: ASTNodeType.FunctionCall;
    callee: IdentifierNode;
    args: ASTNode[];
}

export interface ReturnStatementNode extends ASTNode {
    type: ASTNodeType.ReturnStatement;
    argument: ASTNode;
}



