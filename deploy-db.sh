#!/bin/bash

mongo localhost:27017/test mongodb-create.js

path=public/levels

for file in `ls ${path}`
do
    mongoimport --db NTBdb --collection levels --file ${path}/${file}
done

