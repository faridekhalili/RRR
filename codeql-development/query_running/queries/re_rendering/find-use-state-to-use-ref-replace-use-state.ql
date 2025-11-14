import reactlib
import antipatterns

// this also needs an import to useRef to be added
// pattern 1
from
    UseStateToUseRef changeMe
select 
    formatSourceLocation_AdjustForDecl(changeMe) + "~~~" + "use_state_to_use_ref"