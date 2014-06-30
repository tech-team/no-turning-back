#!/bin/bash

mongo localhost:27017/test mongodb-create.js

path=public/levels

OIFS="$IFS"
IFS=$'\n'

for file in `find ${path}`
do
    mongoimport --db NTBdb --collection levels --file ${file}
done

IFS="$OIFS"
