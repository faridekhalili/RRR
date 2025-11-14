# Rerendering Profiler Chrome Extension

# Overview

This is a Chrome extension that visualizes rerendering in JavaScript framework React (versions 16+) through highlighting DOM elements of components that rerender. A component will be outlined in green upon mounting and will be outlined red upon rerendering.

There are small details specific to each framework: For React, the extension currently is unable to detect the first batch of rerenders, as two snapshots are necessary for detecting them.

# Setup

Install the dependencies and build the project:

```bash
npm install
npm run build
```

Install the [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)

In Chrome, go to 'Manage Extensions' or alternatively the URL <chrome://extensions> and turn on developer mode. Use 'Load unpacked' and select the `react-profiler-extension` folder. The extension will run upon any page load and detection that React.js is present.
