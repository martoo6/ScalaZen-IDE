name := "ScalaJS_Template"

version := "1.0"

scalaVersion  := "2.11.7"

enablePlugins(ScalaJSPlugin)

resolvers += "ScalaZen Repo" at "http://nexus-fakevyral.rhcloud.com/nexus/content/repositories/releases/"

libraryDependencies += "org.scala-js" %%% "scalajs-dom" % "0.8.0"

libraryDependencies += "scalazen" %%% "scalazen" % "1.0.0"

skip in packageJSDependencies := false

persistLauncher in Compile := true

persistLauncher in Test := false

offline := true
