#! /bin/bash

SYSTEM_BIT=$(getconf LONG_BIT)
TEMP_FOLDER=$HOME/nodejs-temp

function install_node() {
	echo "Installing Node.js ..."
	if [ $SYSTEM_BIT == 32 ]; then
		URL=http://nodejs.org/dist/v0.10.26/node-v0.10.26-linux-x86.tar.gz
	fi

	if [ $SYSTEM_BIT == 64 ]; then
		URL=http://nodejs.org/dist/v0.10.26/node-v0.10.26-linux-x64.tar.gz
	fi
	mkdir $TEMP_FOLDER
	mkdir $TEMP_FOLDER/node

	wget -q $URL -O $TEMP_FOLDER/node.tar.gz
	tar -xzf $TEMP_FOLDER/node.tar.gz -C $TEMP_FOLDER/node

	rm -rf $TEMP_FOLDER
}

NODE_INSTALLED=1
hash node > /dev/null 2>&1 || NODE_INSTALLED=0
if [ $NODE_INSTALLED == 1 ]; then
	NODE_VERSION=$(node -v)
	echo "Node.js is already installed. version = $NODE_VERSION"
	echo "Do you want still install node.js? (y/n)"
	read install_proceed
else
	echo "Continue installing node.js? (y/n)"
	read install_proceed
fi

if [ $install_proceed == "y" ]; then
	install_node
	sudo npm install grunt-cli -g
	npm install
fi

echo "Finishing."
exit 0


#npm install