import javascript
import reactlib
import antipatterns

from 
    CallExpr ce, UseStateDecl usd
where 
    exists(StateVariableNotUsedInJsx p2 | ce.getCallee().flow().getALocalSource().getAstNode() = p2.getSetter() and p2 = usd)
select
    formatSourceLocation(ce) + "~~~" + "set_state_to_assignment_current" + "???" + "{" + "varName" + ":" + usd.getStatefulVariable().getName() + "}"