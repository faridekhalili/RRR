
# Code Complexity

This project contains scripts to measure the code complexity (Sloc, Cyclomatic, and Halstead) for all JavaScript (.js/.jsx) and Typescript(.ts/.tsx) files in a project using escomplex and babel.

## Pre-requisite

The scripts assume that all the git repos in the evaluation are cloned locally.

## About the Script

- `config.js` - The config.js file contains the list of projects, their git url, and the path to the source code for that project.
  - Update the srcPath to point to the right location before running.

- `index.js` - The index.js file goes to every project in the config, switches to the `before_transformation` branch and collects complexity. It then switches to the `after_transformation` branch and does the same. It them collects all the data and presents it as a table on the cmd.
  - `calculate-complexity.js` runs the analysis.
  - `compare-complexity` displays the result.

*Note:* Results are stored in `results/`

## Running the Script

- `npm install` - Install the dependencies.
- `node index.js` - Run the analysis and display results.

