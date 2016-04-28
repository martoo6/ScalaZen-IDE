#!/bin/bash

ENSIME_VERSION="0.9.10-SNAPSHOT"
SCALA_VERSION="2.11.7"
NWJS_VERSION="v0.12.3"
SBT_PLUGINS="$HOME/.sbt/0.13/plugins"
SBT_PLUGINS_FILE="$SBT_PLUGINS/plugins.sbt"
CURRENT_DIR="$(pwd -P)"
INSTALL_LOG="$CURRENT_DIR/install.log"


info(){
    echo "[-] $@"
}
error() {
    echo "[!] $@"
}

OS=$(uname -s)
if [[ $OS == *"CYGWIN"* ]]; then
  OS="Windows"
fi

if [[ $OS == 'Darwin' ]]; then
  if [[ ! $(which brew) ]] || [[ $(which brew) == 'sbt not found' ]]; then
    info "Installing Homebrew and Homebrew utilities"
    /usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
  fi
  info "Installing Homebrew utilities"
  brew install coreutils
  brew install gnu-sed --with-default-names
fi

if [[ $OS == 'Darwin' ]]; then
  PATH=$PATH:$(greadlink -f .)
else
  PATH=$PATH:$(readlink -f .)
fi

if [[ $OS == 'Linux' ]]; then
  f=$(ls nwjs-$NWJS_VERSION-linux-* 2>/dev/null | wc -l)
  if [[ "$f" == '0' ]]; then
      ((1<<32)) && B='x64' || B='ia32'
      info "Installing NW.js $B"
      wget -qO- "http://dl.nwjs.io/$NWJS_VERSION/nwjs-$NWJS_VERSION-linux-$B.tar.gz" | tar xz &
      PID_NW=$!
  fi
fi

if [[ $OS == 'Darwin' ]]; then
  f=$(ls nwjs-$NWJS_VERSION-osx-* 2>/dev/null | wc -l | awk {'print $1'})
  if [[ "$f" == '0' ]]; then
      ((1<<32)) && B='x64' || B='ia32'
      info "Installing NW.js $B"
      (curl -sS "http://dl.nwjs.io/$NWJS_VERSION/nwjs-$NWJS_VERSION-osx-$B.zip" > nwjs.zip && unzip nwjs.zip && rm nwjs.zip) &
      PID_NW=$!
  fi
fi

if [[ $OS == 'Windows' ]]; then
  f=$(ls nwjs-$NWJS_VERSION-win-* 2>/dev/null | wc -l)
  if [[ "$f" == '0' ]]; then
      ((1<<32)) && B='x64' || B='ia32'
      info "Installing NW.js $B"
      wget -qO- "http://dl.nwjs.io/$NWJS_VERSION/nwjs-$NWJS_VERSION-win-$B.zip" | unzip &
      PID_NW=$!
  fi
fi

((1<<32)) && ARQ='x64' || ARQ='i586'
export JDK_HOME="$JAVA_HOME"
JAVA="$JAVA_HOME/bin/java"

if [[ ! $(which java) ]] && [[ ! -d "./jdk1.7.0_80" ]] ; then
    if [[ $OS == 'Linux' ]]; then
      info "Java not found. Installing oracle JDK"
      (wget -qO- --no-check-certificate --no-cookies --header "Cookie: oraclelicense=accept-securebackup-cookie" http://download.oracle.com/otn-pub/java/jdk/7u80-b15/jdk-7u80-linux-$ARQ.tar.gz | tar zxf -) &
      PID_JAVA=$!
      JAVA_HOME=$(readlink -f "jdk1.7.0_80")
    fi
    if [[ $OS == 'Darwin' ]]; then
      error "You have to download and install Java prior running this script. Remember to configure the JAVA_HOME enviroment variable."
      exit 1
    fi
    if [[ $OS == 'Windows' ]]; then
      error "You have to download and install Java prior running this script. Remember to configure the JAVA_HOME enviroment variable."
      exit 1
    fi
fi

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

if [[ $(which sbt) ]] || [[ -f ./sbt ]]; then
  info "SBT already in PATH. Skipping."
else
  info "SBT not found, installing..."

  if [[ $OS == 'Linux' ]]; then
    wget -q https://raw.githubusercontent.com/paulp/sbt-extras/master/sbt && chmod 0755 ./sbt
  fi

  if [[ $OS == 'Darwin' ]]; then
    brew install sbt >>"$INSTALL_LOG"
  fi

  if [[ $OS == 'Windows' ]]; then
    error "You have to download and install SBT prior running this script."
    exit 1
  fi
fi

mkdir -p "$SBT_PLUGINS"
#SBT_PLUGIN='addSbtPlugin("com.github.alexarchambault" % "coursier-sbt-plugin" % "1.0.0-M9")'
#[[ $(grep -x "$SBT_PLUGIN" "$SBT_PLUGINS_FILE" 2>/dev/null ) ]] || echo "$SBT_PLUGIN" >> "$SBT_PLUGINS_FILE"

#info "Installing coursier"

#curl -L -o coursier https://git.io/vgvpD && chmod +x coursier

#Lets download fast ! Copy to .ivy2 later somehow
#./coursier fetch org.scala-lang:scala-library:2.10.6 org.scala-sbt:launcher-interface:1.0.0-M1 org.scala-lang:scala-compiler:2.10.6 org.scala-lang:scala-reflect:2.10.6 org.scala-sbt:serialization_2.10:0.1.2
#Should add to coursier
#https://repo1.maven.org/maven2/jline/jline/2.13/jline-2.13.jar ...
#https://repo1.maven.org/maven2/org/fusesource/jansi/jansi/1.11/jansi-1.11.jar ...
#https://repo1.maven.org/maven2/com/jcraft/jsch/0.1.46/jsch-0.1.46.jar ...
#https://repo1.maven.org/maven2/org/scala-lang/modules/scala-pickling_2.10/0.10.1/scala-pickling_2.10-0.10.1.jar ...
#https://repo1.maven.org/maven2/org/json4s/json4s-core_2.10/3.2.10/json4s-core_2.10-3.2.10.jar ...
#https://repo1.maven.org/maven2/org/spire-math/jawn-parser_2.10/0.6.0/jawn-parser_2.10-0.6.0.jar ...
#https://repo1.maven.org/maven2/org/spire-math/json4s-support_2.10/0.6.0/json4s-support_2.10-0.6.0.jar ...
#https://repo1.maven.org/maven2/org/scalamacros/quasiquotes_2.10/2.0.1/quasiquotes_2.10-2.0.1.jar ...
#https://repo1.maven.org/maven2/org/json4s/json4s-ast_2.10/3.2.10/json4s-ast_2.10-3.2.10.jar ...
#https://repo1.maven.org/maven2/com/thoughtworks/paranamer/paranamer/2.6/paranamer-2.6.jar ...
#https://repo1.maven.org/maven2/org/scala-sbt/test-interface/1.0/test-interface-1.0.jar ...

#sbt sbtVersion >>"$INSTALL_LOG"

#info "Adding ensime-sbt plugin"

#SBT_PLUGIN='addSbtPlugin("org.ensime" % "ensime-sbt" % "0.4.0")'
#[[ $(grep -x "$SBT_PLUGIN" "$SBT_PLUGINS_FILE" 2>/dev/null ) ]] || echo "$SBT_PLUGIN" >> "$SBT_PLUGINS_FILE"


if [[ ! -f ensime_2.11-0.9.10-SNAPSHOT-assembly.jar ]]; then
  info "Installing Ensime."
  if [[ $OS == 'Linux' ]]; then
        wget -q "http://ensime.typelevel.org/ensime_2.11-0.9.10-SNAPSHOT-assembly.jar" &
        PID_ENSIME=$!
  fi

  if [[ $OS == 'Darwin' ]]; then
        (curl -sS "http://ensime.typelevel.org/ensime_2.11-0.9.10-SNAPSHOT-assembly.jar" > ensime_2.11-0.9.10-SNAPSHOT-assembly.jar) &
        PID_ENSIME=$!
  fi
fi

if [ $PID_JAVA ] ; then
  info "Waiting for java to finsh download."
  wait $PID_JAVA
fi

info "Using JDK at $JAVA_HOME"

if [[ $OS == 'Darwin' ]]; then
  PATH=$PATH:$(greadlink -f "$JAVA_HOME/bin")
else
  PATH=$PATH:$(readlink -f "$JAVA_HOME/bin")
fi

info "Installing SBT and Coursier. This will take a while."
mkdir -p "coursier-dummy-project"
mkdir -p "coursier-dummy-project"/project
echo "" > coursier-dummy-project/build.sbt
echo 'addSbtPlugin("com.github.alexarchambault" % "coursier-sbt-plugin" % "1.0.0-M9")' > coursier-dummy-project/project/plugins.sbt
echo "sbt.version=0.13.11" > coursier-dummy-project/project/build.properties

pushd coursier-dummy-project &>/dev/null
cat <<EOF > "build.sbt"
name := "coursier-dummy-project"

version := "1.0"

scalaVersion := "2.11.7"
EOF


sbt sbtVersion > "$INSTALL_LOG" 2>&1
popd &>/dev/null

rm -rf coursier-dummy-project


info "Configuring examples. This may take a while..."
FOLDS="templates/ examples/"
for F in $FOLDS; do
    pushd $F &>/dev/null
    for D in $(ls -d */); do
        pushd $D &>/dev/null
        info "Building $(pwd)"
        #Parallel and save in a list of PIDs an check that all of them are finished ?
        sbt "gen-ensime" >>"$INSTALL_LOG" 2>&1
        popd &>/dev/null
    done
    popd &>/dev/null
done

info "Waiting for NW.js to finish download.."
wait $PID_NW
info "Waiting for Ensime to finish download.."
wait $PID_ENSIME
wait

info "Done!"
