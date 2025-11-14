import javascript
import reactlib
import antipatterns

from 
    File f
where 
    exists(ReactProplessNamedPseudoFunctionalComponent rc | rc.getFile() = f) or
    exists(ReactComponentUsesObjectOrArrayProp rc | rc.getFile() = f) or
    exists(ReactComponentUsesSetter rc | rc.getFile() = f) or
    exists(ReactComponentUsesFunctionProp rc | rc.getFile() = f) or
    exists(ConstantTaggedTemplateExpression ctte | ctte.getFile() = f)
select 
    formatFileLocation(f) + "~~~" + "import_memo"