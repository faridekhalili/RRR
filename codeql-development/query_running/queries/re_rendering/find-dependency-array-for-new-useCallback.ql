import javascript 
import reactlib 
import antipatterns

// Need to remove the ones that are self-referential.

from FunctionPassedToReactComponent f, VarAccess va
where exists(UseStateDecl usd | 
  va.getEnclosingFunction() = f
  and (
    va.getName() = usd.getStatefulVariable().getName() or
    va.getName() = usd.getSetter().getName()
  ) and not va instanceof SelfReferentialStateVariableAccess)
select formatSourceLocation(f) + "~~~" + "use_callback_dep???" + va

// If data flow, but you don't actually want data flow.
// va.flow().getALocalSource().getAstNode() = usd.getStatefulVariable() or 
// va.flow().getALocalSource().getAstNode() = usd.getSetter()