#!/bin/bash

NWJS_VERSION="v0.12.3"
OS=$(uname -s)
PATH=$PATH:./
((1<<32)) && ARQ='x64' || ARQ='i586'
((1<<32)) && B='x64' || B='ia32'
if [[ ! $JAVA_HOME ]]; then
  JAVA_HOME=$(readlink -f "jdk-7u80-linux-$ARQ")
fi



function clean_up {
  if [ -f ensime_pid ]; then
    kill $(cat ensime_pid)
    rm ensime_pid
  fi
  if [ -f sbtProc_pid ]; then
    kill $(cat sbtProc_pid)
    rm sbtProc_pid
  fi

	exit
}

trap clean_up SIGHUP SIGINT SIGTERM

if [[ $OS == *"CYGWIN"* ]]; then
  ./nwjs-$NWJS_VERSION-win-$B/nw ./www
fi

if [[ $OS == 'Darwin' ]]; then
  ./nwjs-$NWJS_VERSION-osx-$B/nwjs.app/Contents/MacOS/nwjs ./www
fi

if [[ $OS == 'Linux' ]]; then
  ./nwjs-$NWJS_VERSION-linux-$B/nw ./www;
fi
