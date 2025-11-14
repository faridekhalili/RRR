import javascript
import semmle.javascript.frameworks.React
import semmle.javascript.JSX

/*
 * ReactComponentNode: instance of a React component
 * - getAChildComponent() and getAParnetComponent() have results of React components directly related to the component
 *   called on
 *
 * ReactFunctionalComponent and ReactClassComponent are subclasses of ReactComponentNode
 */

// TODO: Global dataflow analysis is likely inefficient for this purpose
class ComponentReferenceConfiguration extends DataFlow::Configuration {
  ComponentReferenceConfiguration() { this = "ComponentReferenceConfiguration" }

  override predicate isSource(DataFlow::Node source) {
    source.getAstNode() instanceof ReactComponentNode
  }

  override predicate isSink(DataFlow::Node sink) {
    exists(JsxElement ref | sink = ref.getNameExpr().flow())
  }
}

// Finds component node of JSX element
ReactComponentNode getComponentNode(JsxElement elt) {
  exists(ComponentReferenceConfiguration cfg, DataFlow::Node source, DataFlow::Node sink |
    source = result.flow() and
    sink = elt.getNameExpr().flow() and
    cfg.hasFlow(source, sink)
  )
}

predicate existsIntermediateComponent(Expr return, JsxElement elt) {
  exists(JsxElement m |
    exists(ReactComponentNode cmp | cmp = getComponentNode(m)) and
    return = m.getParent*() and
    m = elt.getParent+()
  )
}

abstract class ReactComponentNode extends AST::ValueNode {
  abstract ReactComponentNode getAChildComponent();

  ReactComponentNode getAChildComponentGeneral(Expr return) {
    // JSX elements inside return
    exists(JsxElement elt |
      return = elt.getParent*() and
      result = getComponentNode(elt) and
      not existsIntermediateComponent(return, elt)
    )
    or
    // Children of references to this component
    exists(JsxElement self, JsxElement elt |
      this = getComponentNode(self) and
      self = elt.getParent+() and
      result = getComponentNode(elt)
    )
  }

  ReactComponentNode getAParentComponent() { result.getAChildComponent() = this }

  abstract string getComponentName();
}

class ReactFunctionalComponent extends ReactComponentNode, Function {
  ReactFunctionalComponent() {
    // Function with name that returns JSX
    exists(JsxElement elt | this.getAReturnedExpr() = elt.getParent*()) and
    exists(string s | s = this.getName()) and
    not exists(MethodDeclaration method | method.getBody() = this) // Cannot be a method
  }

  override ReactComponentNode getAChildComponent() {
    exists(Expr return |
      return = this.getAReturnedExpr() and
      result = getAChildComponentGeneral(return)
    )
  }

  override string getComponentName() { result = this.getName() }
}

class ReactClassComponent extends ReactComponentNode, ClassDefinition {
  ReactClassComponent() {
    // Class that extends React.Component
    react()
        .getAPropertyRead("Component")
        .flowsTo(this.getSuperClassDefinition*().getSuperClass().flow())
  }

  override ReactComponentNode getAChildComponent() {
    exists(Expr return |
      return = this.getMethod("render").getBody().getAReturnedExpr() and
      result = getAChildComponentGeneral(return)
    )
  }

  override string getComponentName() { result = this.getName() }
}
