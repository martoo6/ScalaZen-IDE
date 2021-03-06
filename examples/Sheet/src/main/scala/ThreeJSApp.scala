import main.lib._
import org.scalajs.dom
import org.scalajs.dom.raw.KeyboardEvent
import scala.scalajs.js.annotation.JSExport
import scala.scalajs.js.JSApp

/**
 */

@JSExport
class ThreeJSApp extends BasicCanvas with DrawingUtils with SimplexNoise with StatsDisplay with CameraControls{
  Setup._3D.Center.asScene

  addHemisphereLight(0xFFFFFF, 0x05F5F5, 1.0)
  addDirectionalLight(0xFFFFFF, 0.4, (0,1,0)).target.lookAt(center)

  val step = 2
  val cant = 45

  val materials = Palette.mellonBallSurprise.colors.map(_.materializeP(THREE.FrontSide))

  val cubes = for{
    x <- -cant/2 to cant/2
    y <- -cant/2 to cant/2
  }
    yield{
      cube((x*step,-250,y*step),step, materials(rand(materials.size).toInt))
    }



  def render():Unit = {
    cubes.foreach { c =>
      val pos = c.position
      val n = Simplex.noise(pos.x * 0.01, pos.z * 0.01, frameCount * 0.01)
      pos.setY(map(n, -1, 1, 0, 100))
    }
  }
}
