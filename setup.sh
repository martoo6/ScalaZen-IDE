#!/bin/bash

ENSIME_VERSION="0.9.10-SNAPSHOT"
SCALA_VERSION="2.11.2"
NWJS_VERSION="v0.12.3"
SBT_PLUGINS="$HOME/.sbt/0.13/plugins"
SBT_PLUGINS_FILE="$SBT_PLUGINS/plugins.sbt"

info(){
    echo "[-] $@"
}
error() {
    echo "[!] $@"
}

sudo apt-get install -y apt-transport-https >/dev/null

OS=$(uname -s)

if [[ ! $(which sbt) ]]; then
    info "SBT not in PATH, installing..."

    if [[ $OS == 'Linux' ]]; then
      if [[ ! -f /etc/apt/sources.list.d/sbt.list ]]; then
          info "Adding SBT sources list and apt key..."
          info "deb https://dl.bintray.com/sbt/debian /"
          echo "deb https://dl.bintray.com/sbt/debian /" | sudo tee -a /etc/apt/sources.list.d/sbt.list
          sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 642AC823 >/dev/null
      fi
      info "Updating apt..."
      sudo apt-get update >/dev/null
      info "Installing SBT and JDK"
      sudo apt-get install -y sbt default-jdk >/dev/null
    fi

    if [[ $OS == 'Darwin' ]]; then
      brew install sbt
    fi

else
    info "SBT already in PATH. Skipping."
fi

mkdir -p "$SBT_PLUGINS"
SBT_PLUGIN='addSbtPlugin("org.ensime" % "ensime-sbt" % "0.3.2")'
[[ $(grep -x "$SBT_PLUGIN" "$SBT_PLUGINS_FILE" 2>/dev/null ) ]] || echo "$SBT_PLUGIN" >> "$SBT_PLUGINS_FILE"



if [[ $OS == 'Linux' ]]; then
  f=$(ls nwjs-$NWJS_VERSION-linux-* 2>/dev/null | wc -l)
  if [[ "$f" == '0' ]]; then
      ((1<<32)) && B='x64' || B='ia32'
      info "Installing NW.js $B"
      wget -qO- "http://dl.nwjs.io/$NWJS_VERSION/nwjs-$NWJS_VERSION-linux-$B.tar.gz" | tar xz
  fi
fi

if [[ $OS == 'Darwin' ]]; then
  f=$(ls nwjs-$NWJS_VERSION-linux-* 2>/dev/null | wc -l)
  if [[ "$f" == '0' ]]; then
      ((1<<32)) && B='x64' || B='ia32'
      info "Installing NW.js $B"
      wget -qO- "http://dl.nwjs.io/$NWJS_VERSION/nwjs-$NWJS_VERSION-osx-$B.zip" | unzip
  fi
fi

export JDK_HOME="$JAVA_HOME"
JAVA="$JAVA_HOME/bin/java"
if [ ! -x "$JAVA" ] ; then
    error "Java home incorrect, $JAVA is not the java binary!"
    exit 1
fi
info "Using JDK at $JAVA_HOME"

FOLDS="templates/ examples/"
for F in $FOLDS; do
    pushd $F &>/dev/null
    for D in $(ls -d */); do
        pushd $D &>/dev/null
        info "Building $(pwd)"
        sbt "gen-ensime" 1>/dev/null
        popd &>/dev/null
    done
    popd &>/dev/null
done

RESOLUTION_DIR="$(pwd -P)"/ensime-server
CLASSPATH_FILE="$RESOLUTION_DIR/classpath"
CLASSPATH_LOG="$RESOLUTION_DIR/sbt.log"
mkdir -p "ensime-server"
mkdir -p "$RESOLUTION_DIR"/project

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
sbt.version=0.13.9
EOF

cd "$RESOLUTION_DIR"
info "Resolving, log available in $CLASSPATH_LOG. This may take a while..."
sbt saveClasspath > "$CLASSPATH_LOG"
info "Done!"
