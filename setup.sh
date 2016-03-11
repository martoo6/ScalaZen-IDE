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
  brew install grep --with-default-names
  brew install gnu-sed --with-default-names
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
  f=$(ls nwjs-$NWJS_VERSION-linux-* 2>/dev/null | wc -l)
  if [[ "$f" == '0' ]]; then
      brew install wget
      ((1<<32)) && B='x64' || B='ia32'
      info "Installing NW.js $B"
      wget -qO- "http://dl.nwjs.io/$NWJS_VERSION/nwjs-$NWJS_VERSION-osx-$B.zip" | unzip &
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

export JDK_HOME="$JAVA_HOME"
JAVA="$JAVA_HOME/bin/java"
if [ ! -x "$JAVA" ] ; then
    if [[ $OS == 'Linux' ]]; then
      info "JAVA_HOME not found. Installing default JDK"
      sudo apt-get install -y --no-install-recommends default-jdk >>"$INSTALL_LOG"
      echo "JAVA_HOME=\"/usr/lib/jvm/default-java\"" | sudo tee -a /etc/environment
      source /etc/environment
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
info "Using JDK at $JAVA_HOME"

if [[ ! $(which sbt) ]] || [[ $(which sbt) == 'sbt not found' ]]; then
    info "SBT not in PATH, installing..."

    if [[ $OS == 'Linux' ]]; then
      if [[ ! -f /etc/apt/sources.list.d/sbt.list ]]; then
          info "Adding SBT sources list and apt key..."
          info "deb https://dl.bintray.com/sbt/debian /"
          echo "deb https://dl.bintray.com/sbt/debian /" | sudo tee -a /etc/apt/sources.list.d/sbt.list
          sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 642AC823 >/dev/null
      fi
      sudo apt-get install -y apt-transport-https >/dev/null
      info "Updating apt..."
      sudo apt-get update >/dev/null
      info "Installing SBT"
      sudo apt-get install -y sbt >>"$INSTALL_LOG"
    fi

    if [[ $OS == 'Darwin' ]]; then
      brew install sbt >>"$INSTALL_LOG"
    fi

    if [[ $OS == 'Windows' ]]; then
      error "You have to download and install SBT prior running this script."
      exit 1
    fi

else
    info "SBT already in PATH. Skipping."
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

RESOLUTION_DIR="$(pwd -P)"/ensime-server
CLASSPATH_FILE="$RESOLUTION_DIR/classpath"
CLASSPATH_LOG="$RESOLUTION_DIR/sbt.log"
mkdir -p "ensime-server"
mkdir -p "$RESOLUTION_DIR"/project

echo 'addSbtPlugin("com.github.alexarchambault" % "coursier-sbt-plugin" % "1.0.0-M9")' > "$RESOLUTION_DIR"/project/plugins.sbt

cat <<EOF > "$RESOLUTION_DIR/build.sbt"
import sbt._

import IO._
import java.io._
scalaVersion := "${SCALA_VERSION}"
ivyScala := ivyScala.value map { _.copy(overrideScalaVersion = true) }
// allows local builds of scala
resolvers += Resolver.mavenLocal
resolvers += Resolver.sonatypeRepo("snapshots")
resolvers += "Typesafe repository" at "http://repo.typesafe.com/typesafe/releases/"
resolvers += "Akka Repo" at "http://repo.akka.io/repository"
resolvers += "Netbeans" at "http://bits.netbeans.org/maven2"

libraryDependencies ++= Seq(
  "org.ensime" %% "ensime" % "${ENSIME_VERSION}",
  "org.scala-lang" % "scala-compiler" % scalaVersion.value force(),
  "org.scala-lang" % "scala-reflect" % scalaVersion.value force(),
  "org.scala-lang" % "scalap" % scalaVersion.value force()
)
val saveClasspathTask = TaskKey[Unit]("saveClasspath", "Save the classpath to a file")
saveClasspathTask := {
  val managed = (managedClasspath in Runtime).value.map(_.data.getAbsolutePath)
  val unmanaged = (unmanagedClasspath in Runtime).value.map(_.data.getAbsolutePath)
  val out = file("${CLASSPATH_FILE}")
  write(out, (unmanaged ++ managed).mkString(File.pathSeparator))
}
EOF

cat <<EOF > "$RESOLUTION_DIR/project/build.properties"
sbt.version=0.13.11
EOF

pushd $RESOLUTION_DIR &>/dev/null
info "Installing Ensime, log available in $CLASSPATH_LOG. This may take a while..."
sbt saveClasspath > "$CLASSPATH_LOG" 2>&1
popd &>/dev/null


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
wait

info "Done!"
