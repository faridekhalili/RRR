import javascript
import reactlib
import antipatterns

// This is for detecting cases where the function passed can affect the state of the component.
// from ReactNamedPseudoFunctionalComponent rc, JsxElement jsx_rc
// where 
//     exists(JsxElement jsxe, UseStateDecl usd |
//         jsxe.getName() = rc.getName() and 
//         (jsxe.getAnAttribute().getValue().(Identifier).getName() = usd.getSetter().getName() or 
//          jsxe.getAnAttribute().getValue().flow().getALocalSource().getAstNode() instanceof FunctionWithStateSetter)
//          and jsx_rc = jsxe)
// select rc, jsx_rc

// This is the state where the setter is literally passed.
from ReactComponentUsesSetter rc
select formatSourceLocation(rc) + "~~~" + "memoize"
