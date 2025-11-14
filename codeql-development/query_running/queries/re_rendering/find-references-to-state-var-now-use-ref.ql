import javascript
import antipatterns
import reactlib

// from VarRef vr
// where vr.getName() = "loginUsername" and
// not exists(UseStateToUseRef p1 | p1.getStatefulVariable() = vr)
// select vr.flow().getALocalSource()

from 
    VarRef vr
where
    exists(UseStateToUseRef p1 | vr.flow().getALocalSource().getAstNode() = p1.getStatefulVariable())
select
    formatSourceLocation(vr) + "~~~" + "add_dot_current_value"