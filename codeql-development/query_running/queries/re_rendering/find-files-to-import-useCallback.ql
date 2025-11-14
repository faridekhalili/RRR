import javascript
import reactlib
import antipatterns

from ReactComponentUsesFunctionProp rc
select formatFileLocation(rc.getFunction().getFile()) + "~~~" + "import_use_callback"