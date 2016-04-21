#!/bin/bash

NWJS_VERSION="v0.12.3"
OS=$(uname -s)

if [[ $OS == 'Darwin' ]]; then
  PATH=$PATH:$(greadlink -f .)
else
  PATH=$PATH:$(readlink -f .)
fi

((1<<32)) && B='x64' || B='ia32'

if [[ ! $JAVA_HOME ]]; then
  #This is not portable for Versions, does it work on mac ?
  if [[ -d "./jdk1.7.0_80" ]]; then
      JAVA_HOME=$(readlink -f "jdk1.7.0_80")
  fi

  if [[ $(which java) ]]; then
      if [[ $OS == 'Darwin' ]]; then
        echo "Trying to obtain JAVA_HOME. This may not work."
        JAVA_HOME="$(greadlink -f $(dirname $(greadlink -f $(which java)))/../..)"
      else
        JAVA_HOME="$(readlink -f $(dirname $(readlink -f $(which java)))/../..)"
      fi
  fi
fi

if [[ $OS == 'Darwin' ]]; then
  PATH=$PATH:$(greadlink -f "$JAVA_HOME/bin")
else
  PATH=$PATH:$(readlink -f "$JAVA_HOME/bin")
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
