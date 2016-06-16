import main.lib._
import org.scalajs.dom
import org.scalajs.dom.raw.KeyboardEvent
import scala.scalajs.js.annotation.JSExport
import scala.scalajs.js.JSApp

/**
 * Save Image
 * Perlin Noise
 * Palettes
 * Stroke
 */

@JSExport
class ThreeJSApp extends BasicCanvas with DrawingUtils with SimplexNoise with StatsDisplay with CameraControls{
  Setup._2D.asScene

  val radius = 100

  val polarCoords = for {
    g <- (0 to 40).map(_ * TWO_PI / 20)
    t <- (-20 to 20).map(_ * PI / 20)
  } yield (g, t)

  val radius2 = radius * 0.3
  val coords = polarCoords.map { case (g, t) => (sin(g) * cos(t) * radius, cos(g) * sin(t) * radius, sin(t) * radius) }.toVector ::
    polarCoords.map { case (g, t) => (sin(g) * cos(t) * radius, cos(g) * sin(t) * radius, sin(t) * radius) }.toVector ::
    Nil

  val vals = coords.head.map(_ => segSphere(center, 2, 6, Rgb(0, 0, 0)))

  val all = vals.zipWithIndex

  val group = grouped(vals)

  def render(): Unit = {
    val time = map(frameCount, 0, 60 * 5, 0, TWO_PI)
    val t1 = time.toInt % coords.size
    val t2 = (time + 1).toInt % coords.size
    all.foreach {
      case (v, i) =>
        val pos = v.position
        pos.lerpVectors(coords(t1)(i), coords(t2)(i), time % 1)
        v.material.color.setRGB(pos.x * 0.01.constrain(0, 1), pos.y * 0.01.constrain(0, 1), pos.z * 0.01.constrain(0, 1))
    }
    group.setRotationFromAxisAngle(yAxis, map(frameCount, 0, 60 * 5, 0, TWO_PI))
  }
}
