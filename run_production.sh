#!/bin/bash

if [ $1 == 'build' ]; then
	grunt build
fi
NODE_ENV=production node app.js