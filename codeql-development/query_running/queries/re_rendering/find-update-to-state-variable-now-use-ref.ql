import javascript
import reactlib
import antipatterns

from 
    CallExpr ce, UseStateDecl usd
where 
    exists(UseStateToUseRef p1 | ce.getCallee().flow().getALocalSource().getAstNode() = p1.getSetter() and p1 = usd)
select
    formatSourceLocation(ce) + "~~~" + "set_state_to_assignment_current_value" + "???" + "{" + "varName" + ":" + usd.getStatefulVariable().getName() + "}"