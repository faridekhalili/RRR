import javascript
import semmle.javascript.frameworks.React
import semmle.javascript.JSX
import ReactComponentLib

// Declaration statement that calls React.useState
class UseStateDecl extends DeclStmt {
  UseStateDecl() {
    exists(CallExpr call |
      call = this.getAChild().getChild(1) and
      react().getAPropertyRead("useState").flowsTo(call.getCallee().flow())
    )
  }

  ReactFunctionalComponent getComponent() {
    exists(CallExpr call | result = call.getParent*() and call = this.getAChild().getChild(1))
  }

  Identifier getSetter() { result = this.getAChild().getChild(0).(ArrayPattern).getChild(1) }
}

// TODO: Sibling components are found based on whether they are in the same return expression,
// not whether they share a JSX parent (which might be better)
JsxElement getASibling(Expr return, JsxElement elt) {
  // Elements share a common ancestor
  result.getParent+() = elt.getParent+() and
  not result = elt and
  return = elt.getParent*() and
  return = result.getParent*() // Elements belong to the same return expression
}

Identifier getAReference(Identifier id) {
  exists(DataFlow::SourceNode source, DataFlow::Node end |
    source.getAstNode() = id and
    end.getAstNode() = result and
    source.flowsTo(end)
  )
}

class StateInfluencingElement extends JsxElement {
  StateInfluencingElement() {
    // JSX element within some functional component
    exists(ReactFunctionalComponent cmp, UseStateDecl state |
      cmp = state.getComponent() and
      cmp.getAReturnedExpr() = this.getParent*() and
      this = getAReference(state.getSetter()).getParent*()
    ) // Element is a parent of a reference to a setter
  }

  UseStateDecl getStateDecl() { this = getAReference(result.getSetter()).getParent*() }
}

// Finds siblings (user-defined ones) of components that influence parent state
from StateInfluencingElement elt, JsxElement sibling
where
  sibling = getASibling(elt.getStateDecl().getComponent().getAReturnedExpr(), elt) and
  not exists(StateInfluencingElement child | sibling = child.getParent*()) and
  exists(ReactComponentNode cmp | cmp = getComponentNode(sibling))
select sibling
