import javascript
import reactlib

// Pattern One
class UseStateToUseRef extends UseStateDecl {

    JsxAttribute onChange;

    UseStateToUseRef() {
        exists(JsxAttribute a, CallExpr ce | 
            a.getParent().(JsxElement).getName().toLowerCase() in ["form", "input", "select", "textArea"] and
            a.getName() in ["onChange"] and
            not a.getParent().(JsxElement).getAnAttribute().getName() = "ref" and 
            ce.getCallee().flow().getALocalSource().getAstNode() = this.getSetter() and
            (ce.getParent*() = a.getValue() or exists(Function f | a.getValue().flow().getALocalSource().getAstNode() = f and ce.getParent*() = f)) and
            onChange = a)
    }

    JsxAttribute getOnChange() {
        result = onChange
    }
}

// Pattern Two
class StateVariableNotUsedInJsx extends UseStateDecl {
    StateVariableNotUsedInJsx() {
        not this.getStatefulVariable() instanceof FlowsToJSX and
        not exists(CallExpr ce, UseStateDecl usd, VarAccess va |
            ce.getCallee().flow().getALocalSource().getAstNode() = usd.getSetter() and
            ce.getNumArgument() = 1 and ce.getArgument(0).(VarAccess).flow().getALocalSource().getAstNode() = usd.getStatefulVariable() and
            va.getName() = this.getStatefulVariable().getName() and ce.getEnclosingFunction() = va.getEnclosingFunction())
    }
}

// Pattern Three A
// Actually just ReactProplessNamedPseudoFunctionalComponent

// Pattern Three B
// TaggedTemplateExpressions can be memoized.
class ConstantTaggedTemplateExpression extends TaggedTemplateExpr {
    ConstantTaggedTemplateExpression() {
        this.getTemplate().getNumElement() = 1
    }
}

// Pattern Four A
class ReactComponentUsesObjectOrArrayProp extends ReactNamedPseudoFunctionalComponent {
    ReactComponentUsesObjectOrArrayProp() {
        exists(JsxElement e, UseStateDecl usd | 
            e.getNameExpr().getValue() = this.getName() and
            (e.getAnAttribute().getValue().(ArrayAccess).getBase().flow().getALocalSource().getAstNode() = usd.getStatefulVariable() or
            e.getAnAttribute().getValue().(PropAccess).getBase().flow().getALocalSource().getAstNode() = usd.getStatefulVariable())
        )
    }
}

// Pattern Four B
class ReactComponentUsesSetter extends ReactNamedPseudoFunctionalComponent {
    ReactComponentUsesSetter() {
        exists(JsxElement jsxe, UseStateDecl usd | 
            jsxe.getNameExpr().getValue() = this.getName() and
            jsxe.getAnAttribute().getValue().(Identifier).getName() = usd.getSetter().getName()
        )
    }
}

// Pattern Five
class ReactComponentUsesFunctionProp extends ReactNamedPseudoFunctionalComponent {

    Function f;
    ReactComponentUsesFunctionProp() {
        exists(JsxElement e | 
            e.getNameExpr().getValue() = this.getName() and
            e.getAnAttribute().getValue().flow().getALocalSource().getAstNode() = f and
            // the function doesnt have an if or ternary statement as a parent
            not exists(ConditionalExpr ifs | f.getParent*() = ifs)
        )
    }

    Function getFunction() {
        result = f
    }
}

class FunctionPassedToReactComponent extends Function {
    FunctionPassedToReactComponent() {
        exists(ReactComponentUsesFunctionProp rc | rc.getFunction() = this)
    }
}