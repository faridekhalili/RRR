#!/bin/bash

# Make sure the paths line up.
caseStudiesPath=../db_caching/case-studies
dbTgtDir=../db_caching/qldbs
projName=$1

# Create the DB.
codeql database create --language=javascript --source-root $caseStudiesPath/$projName $dbTgtDir/$projName > /dev/null 2>&1
