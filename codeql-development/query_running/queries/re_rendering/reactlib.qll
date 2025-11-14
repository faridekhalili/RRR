import javascript

// need: path/to/file.js:<5,11>--<7,1>~~~insert_IIFE
string formatSourceLocation(AstNode ast) {
    result = ast.getFile().getRelativePath() + ":<"
            + ast.getLocation().getStartLine() + ","
            + ast.getLocation().getStartColumn() + ">--<"
            + ast.getLocation().getEndLine() + ","
            + ast.getLocation().getEndColumn() + ">"
}

string formatSourceLocation_AdjustForDecl(DeclStmt ast) {
    result = formatSourceLocation_VarDecl(ast) or 
    result = formatSourceLocation_LetDecl(ast) or
    result = formatSourceLocation_ConstDecl(ast)
}

string formatSourceLocation_VarDecl(VarDeclStmt ast) {
    result = ast.getFile().getRelativePath() + ":<" 
    + ast.getLocation().getStartLine() + ","
    + (4 + ast.getLocation().getStartColumn()) + ">--<"
    + ast.getLocation().getEndLine() + ","
    + (ast.getLocation().getEndColumn()) + ">"
}

string formatSourceLocation_ConstDecl(ConstDeclStmt ast) {
    result = ast.getFile().getRelativePath() + ":<"
    + ast.getLocation().getStartLine() + ","
    + (6 + ast.getLocation().getStartColumn()) + ">--<"
    + ast.getLocation().getEndLine() + ","
    + (ast.getLocation().getEndColumn()) + ">"
}

string formatSourceLocation_LetDecl(LetStmt ast) {
    result = ast.getFile().getRelativePath() + ":<"
    + ast.getLocation().getStartLine() + ","
    + (4 + ast.getLocation().getStartColumn()) + ">--<"
    + ast.getLocation().getEndLine() + ","
    + (ast.getLocation().getEndColumn()) + ">"
}

string formatFileLocation(File f) {
    result = f.getRelativePath() + ":<"
            + f.getLocation().getStartLine() + ","
            + f.getLocation().getStartColumn() + ">--<"
            + f.getLocation().getEndLine() + ","
            + f.getLocation().getEndColumn() + ">"
}

string formatSourceLocationDataFlow(DataFlow::Node ast) {
    result = ast.getAstNode().getFile().getRelativePath() + ":<" 
            + ast.getAstNode().getLocation().getStartLine() + "," 
            + ast.getAstNode().getLocation().getStartColumn() + ">--<"
            + ast.getAstNode().getLocation().getEndLine() + ","
            + ast.getAstNode().getLocation().getEndColumn() + ">"
}

// This should match Expressions that can flow into JSX.
// But not into class attributes. <- actually this is incorrect
class FlowsToJSX extends Expr {
    FlowsToJSX() {
        exists(JsxNode jsxn, Expr e | 
            e.getParent*() = jsxn and 
            e.flow().getALocalSource().getAstNode() = this // and
            // not a class attribute (these do not affect rendering?)
            // not exists(JsxAttribute jsxa | 
            //     jsxa.getName() = "className" and
            //     e.getParent*() = jsxa)
        )
        and
        not this.getParent*() instanceof JsxNode
    }
}

class ReactPseudoFunctionalComponent extends Function {
    ReactPseudoFunctionalComponent() {
        exists(JsxElement jsxe | jsxe.getParent*() = this.(Function).getAReturnedExpr()) and
        not this instanceof Method
    }
}

class ReactNamedPseudoFunctionalComponent extends ReactPseudoFunctionalComponent {
    ReactNamedPseudoFunctionalComponent() {
        this.(Function).getName() != ""
    }
}

class ReactProplessNamedPseudoFunctionalComponent extends ReactNamedPseudoFunctionalComponent {
    ReactProplessNamedPseudoFunctionalComponent() {
        this.(Function).getNumParameter() = 0
    }
}

class ExpandedReactComponent extends AstNode {
    ExpandedReactComponent() {
        this instanceof ReactPseudoFunctionalComponent or
        this instanceof ReactComponent
    }
}

// class StatefulVariableFlow extends DataFlow::SourceNode::Range {
//     StatefulVariableFlow() {
//         exists(DeclStmt ds | 
//             ds.getAChild().getChild(1).(CallExpr).getCalleeName() = "useState" and
//             ds.getADecl().getBindingPattern().(ArrayPattern).getElement(0).flow() = this)
//     }
// }

// class StatefulUpdateFlow extends DataFlow::SourceNode::Range {
//     StatefulUpdateFlow() {
//         exists(DeclStmt ds | 
//             ds.getAChild().getChild(1).(CallExpr).getCalleeName() = "useState" and
//             ds.getADecl().getBindingPattern().(ArrayPattern).getElement(1).flow() = this)
//     }
// }

class UseStateDecl extends DeclStmt
{
    UseStateDecl() {
        exists(CallExpr call |
            call = this.getAChild().getChild(1) and
            react().getAPropertyRead("useState").flowsTo(call.getCallee().flow()))
    }

    // StatefulVariableFlow getStatefulVariableFlow() {
    //     exists(StatefulVariableFlow sv | 
    //         this.getStatefulVariable().flow() = sv and result = sv)
    // }

    // StatefulUpdateFlow getStateUpdateFlow() {
    //     exists(StatefulUpdateFlow sv | 
    //         this.getSetter().flow() = sv and result = sv)
    // }

    ReactPseudoFunctionalComponent getComponent() {
        exists(CallExpr call | result = call.getParent*() and call = this.getAChild().getChild(1))
    }

    VarDecl getSetter() {
        result = this.getAChild().getChild(0).(ArrayPattern).getChild(1)
    }

    VarDecl getStatefulVariable() {
        result = this.getAChild().getChild(0).(ArrayPattern).getChild(0)
    }
}

class ReactContextVar extends Variable {
    ReactContextVar() {
        exists(VariableDeclarator vd, CallExpr ce |
            ce.getCalleeName() = "createContext" and 
            vd.getInit() = ce and
            vd.getBindingPattern().getVariable() = this)
    }
}

class FunctionWithStateSetter extends Function {
    FunctionWithStateSetter() {
        exists(UseStateDecl usd, InvokeExpr ie |
            ie.getEnclosingFunction*() = this and
            (ie.getCallee().flow().getALocalSource().getAstNode() = usd.getSetter() or
             ie.getCallee().flow().getALocalSource().getAstNode() instanceof FunctionWithStateSetter))
    }
}

JsxElement siblingOfJsxElement(JsxElement me) {
    exists(JsxElement other |
        other.getParent() = me.getParent() and
        other != me and
        result = other)
}

class SelfReferentialStateVariableAccess extends VarAccess {
    SelfReferentialStateVariableAccess() {
        exists(UseStateDecl usd, CallExpr ce |
            this.getName() = usd.getStatefulVariable().getName() and
            this.getParent*() = ce and ce.getCalleeName() = usd.getSetter().getName())
    }
}