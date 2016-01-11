#!/bin/sh

echo "deb https://dl.bintray.com/sbt/debian /" | sudo tee -a /etc/apt/sources.list.d/sbt.list
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 642AC823
sudo apt-get update
sudo apt-get install sbt
sudo apt-get install default-jdk
mkdir -p ~/.sbt/0.13/plugins
echo 'addSbtPlugin("org.ensime" % "ensime-sbt" % "0.3.2")' >> ~/.sbt/0.13/plugins/plugins.sbt
#Should check if x64 or not and change download link
#http://dl.nwjs.io/v0.12.3/nwjs-v0.12.3-linux-ia32.tar.gz
wget -qO- "http://dl.nwjs.io/v0.12.3/nwjs-v0.12.3-linux-x64.tar.gz" | tar xvz
#For distribution should read http://docs.nwjs.io/en/latest/For%20Users/Package%20and%20Distribute/
