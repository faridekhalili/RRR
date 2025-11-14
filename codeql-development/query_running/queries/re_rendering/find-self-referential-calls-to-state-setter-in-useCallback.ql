import javascript 
import reactlib 
import antipatterns

// Modify to only pick up function literals that are defined in the call to setState(...)

from ReactComponentUsesFunctionProp rc, CallExpr ce, Identifier i
where exists(UseStateDecl usd | ce.getEnclosingFunction() = rc.getFunction()
  and ce.getCallee().flow().getALocalSource().getAstNode() = usd.getSetter()
  and exists(VarAccess va | va.getParent*() = ce and va.getName() = usd.getStatefulVariable().getName())
  and usd.getStatefulVariable() = i)
select formatSourceLocation(ce) + "~~~" + "self_referential_set_state" + "???" + "{" + "varName" + ":" + i.getName() + "}"

// If dataflow is needed.
// and exists(Expr e | e.getParent*() = ce and e.flow().getALocalSource().getAstNode() = usd.getStatefulVariable())