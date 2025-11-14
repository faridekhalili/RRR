import javascript
import reactlib
import antipatterns

from UseStateDecl usd
where usd instanceof UseStateToUseRef or usd instanceof StateVariableNotUsedInJsx
select formatFileLocation(usd.getFile()) + "~~~" + "import_use_ref"