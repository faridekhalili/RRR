import reactlib
import antipatterns

// this also needs an import to useRef to be added
// pattern 1 -- the components that need to be changed
from
    UseStateToUseRef changeMe
select 
    formatSourceLocation(changeMe.getOnChange()) + "~~~" + "onChange_to_ref" + "???" + "{varName:" + changeMe.getStatefulVariable().getName() + "}"