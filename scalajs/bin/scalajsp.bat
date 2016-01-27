@ECHO OFF
set SCALA_BIN_VER=2.11
set SCALAJS_VER=0.6.6

set CLILIB="%~dp0\..\lib\scalajs-cli-assembly_%SCALA_BIN_VER%-%SCALAJS_VER%.jar"

scala -classpath %CLILIB% org.scalajs.cli.Scalajsp %*
