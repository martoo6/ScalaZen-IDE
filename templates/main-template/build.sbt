name := "ScalaJS_Template"

version := "1.0"

scalaVersion  := "2.11.2"

enablePlugins(ScalaJSPlugin)

libraryDependencies += "org.scala-js" %%% "scalajs-dom" % "0.8.0"

//ScalaJSKeys.jsDependencies += scala.scalajs.sbtplugin.RuntimeDOM

skip in packageJSDependencies := false

persistLauncher in Compile := true

persistLauncher in Test := false
