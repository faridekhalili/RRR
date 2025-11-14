import javascript 
import reactlib 
import antipatterns

from ReactComponentUsesFunctionProp rc
select formatSourceLocation(rc.getFunction()) + "~~~" + "use_callback"