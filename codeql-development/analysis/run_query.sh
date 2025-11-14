#!/bin/bash

# Define the CodeQL executable path
CODEQL_EXEC="codeql"

# Paths
qlDbPath="../db_caching/qldbs/"
queryResultsDir="../query_running/query_results"
csvResultsDir="../query_running/CSV_results"

query=$1
projName=$2
queryDir=$3      # e.g. ../query_running/queries/re_rendering
groupName=$(basename "$queryDir")  # e.g. re_rendering

# Validate inputs
if [ ! -f "$queryDir/$query" ]; then
    echo "Error: Query file not found: $queryDir/$query"
    exit 1
fi

if [ ! -d "${qlDbPath%/}/$projName" ]; then
    echo "Error: Database directory not found: $qlDbPath$projName"
    exit 1
fi

# Prepare directories
# Ensure per-query result folders
for file in "$queryDir"/*.ql; do
    filename=$(basename "$file" .ql)
    mkdir -p "$queryResultsDir/$filename"
done

# Ensure group/project folder in CSV_results
mkdir -p "$csvResultsDir/$groupName/$projName"

# Derive names
queryName="${query%%.*}"
outputFileName="$queryResultsDir/$queryName/$projName.bqrs"
csvFileName="$queryResultsDir/$queryName/$projName.csv"
csvMirrorFile="$csvResultsDir/$groupName/$projName/$queryName.csv"

# Run if not already done
if [ -f "$outputFileName" ]; then
    echo "Skipping: $outputFileName already exists"
else
    echo "[INFO] Running '$queryName' on '$projName'..."
    $CODEQL_EXEC query run \
      --database="$qlDbPath$projName" \
      --output="$outputFileName" \
      "$queryDir/$query" > /dev/null 2>&1

    $CODEQL_EXEC bqrs decode \
      --format=csv \
      "$outputFileName" > "$csvFileName" 2>/dev/null

    # Mirror CSV to CSV_results/<groupName>/<projName>/
    if [ -f "$csvFileName" ]; then
        cp "$csvFileName" "$csvMirrorFile"
        echo "Copied CSV to $csvMirrorFile"
    fi
fi
