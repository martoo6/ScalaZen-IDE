name := "ScalaJS_Template"

version := "1.0"

scalaVersion  := "2.11.8"

enablePlugins(ScalaJSPlugin)

libraryDependencies += "org.scala-js" %%% "scalajs-dom" % "0.9.1"

resolvers += "ScalaZen Repo" at "http://nexus-fakevyral.rhcloud.com/nexus/content/repositories/releases/"

libraryDependencies += "scalazen" %%% "scalazen" % "1.0.0"

skip in packageJSDependencies := false

persistLauncher in Compile := true

persistLauncher in Test := false

offline := true
