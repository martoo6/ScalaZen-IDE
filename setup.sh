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

ENSIME_VERSION="0.9.10-SNAPSHOT"

SCALA_VERSION="2.11.2"

export JDK_HOME="$JAVA_HOME"
JAVA="$JAVA_HOME/bin/java"
if [ ! -x "$JAVA" ] ; then
    echo ":java-home is not correct, $JAVA is not the java binary."
    exit 1
fi
echo "  -> Using JDK at $JAVA_HOME"

cd (cd templates/main-template/; sbt "gen-ensime")

RESOLUTION_DIR=`pwd -P`/ensime-server
CLASSPATH_FILE="$RESOLUTION_DIR/classpath"
CLASSPATH_LOG="$RESOLUTION_DIR/sbt.log"
mkdir -p "ensime-server"
mkdir -p "$RESOLUTION_DIR"/project

echo "  -> Resolving, log available in $CLASSPATH_LOG"
# This bit is slow, and can definitely be cached to produce CLASSPATH

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
sbt saveClasspath > "$CLASSPATH_LOG"
