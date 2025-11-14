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
    exists(StateVariableNotUsedInJsx p2 | vr.flow().getALocalSource().getAstNode() = p2.getStatefulVariable())
select
    formatSourceLocation(vr) + "~~~" + "add_dot_current"