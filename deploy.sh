#! /bin/bash

SYSTEM_BIT=$(getconf LONG_BIT)
TEMP_FOLDER=$HOME/.nodejs-temp
NODE_VERSION=v0.10.28

function install_node() {
	echo "Installing Node.js ..."
	mkdir $TEMP_FOLDER
	mkdir $TEMP_FOLDER/node


	if [ $SYSTEM_BIT == 32 ]; then
		NODE_BITS=x86
	fi

	if [ $SYSTEM_BIT == 64 ]; then
		NODE_BITS=x64
	fi

	NODE_NAME=node-$NODE_VERSION-linux-$NODE_BITS

	URL=http://nodejs.org/dist/$NODE_VERSION/$NODE_NAME.tar.gz
	wget -q $URL -O $TEMP_FOLDER/node.tar.gz
	tar -xzf $TEMP_FOLDER/node.tar.gz -C $TEMP_FOLDER

	cd $TEMP_FOLDER/$NODE_NAME

	./configure && make && sudo make install
	
	rm -rf $TEMP_FOLDER
}

function install_ruby() {
	echo "Installing Ruby ..."
	sudo apt-get --force-yes --yes install ruby1.9.1  >/dev/null
	sudo gem install sass  >/dev/null
}


function check_node() {
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
	fi

}

function check_ruby() {
	RUBY_INSTALLED=1
	hash node > /dev/null 2>&1 || RUBY_INSTALLED=0
	if [ $RUBY_INSTALLED == 1 ]; then
		RUBY_VERSION=$(ruby -v)
		echo "Ruby is already installed. version = $RUBY_VERSION"
		echo "Do you want still install ruby? (y/n)"
		read install_proceed
	else
		echo "Continue installing ruby? (y/n)"
		read install_proceed
	fi

	if [ $install_proceed == "y" ]; then
		install_ruby
	fi
}

check_node
check_ruby

echo "Installing prequisites for the frontend-game"

sudo npm install grunt-cli -g
npm install

echo "Done."
exit 0


#npm install