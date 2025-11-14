function injectScript(src, elt)
{
    // Inject script with access to window object
    let script = document.createElement("script")
    script.setAttribute("src", src)

    elt.prepend(script)
}

// Inject script with access to window object
injectScript(chrome.runtime.getURL("/dist/react.js"), document.head)
