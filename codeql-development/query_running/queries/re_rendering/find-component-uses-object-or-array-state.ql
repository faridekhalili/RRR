import javascript
import reactlib
import antipatterns

from ReactComponentUsesObjectOrArrayProp rc
select formatSourceLocation(rc) + "~~~" + "memoize"

// TODO: double check that this detects object state