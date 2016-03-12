#!/bin/bash

NWJS_VERSION="v0.12.3"
OS=$(uname -s)
((1<<32)) && B='x64' || B='ia32'

if [[ $OS == *"CYGWIN"* ]]; then
  ./nwjs-$NWJS_VERSION-win-$B/nw ./www
fi

if [[ $OS == 'Darwin' ]]; then
  ./nwjs-$NWJS_VERSION-osx-$B/nw ./www
fi

if [[ $OS == 'Linux' ]]; then
  ./nwjs-$NWJS_VERSION-linux-$B/nw ./www;
fi
