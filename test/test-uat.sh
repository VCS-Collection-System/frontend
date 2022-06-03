#!/bin/bash

echo "test I'm running:" $WHICH_TEST
echo "npm-envs: " $SOME_VAR
export 

set +e

mkdir -p uat-reports
if [ $WHICH_TEST = "featureless" ]
then
  echo "Running featureless"
  mocha --reporter xunit --reporter-option output=/tmp/xat-results.xml --file test/xat.spec.js --ignore test/e2e.spec.js
  cp /tmp/xat-results.xml uat-reports/xat-results.xml
  cat uat-reports/xat-results.xml
else
  echo "Running e2e"
  mocha --reporter xunit --reporter-option output=/tmp/uat-results.xml --file test/e2e.spec.js --ignore test/xat.spec.js
  cp /tmp/uat-results.xml uat-reports/uat-results.xml
  cat uat-reports/uat-results.xml
fi
ERROR_CODE=$?
exit $ERROR_CODE
