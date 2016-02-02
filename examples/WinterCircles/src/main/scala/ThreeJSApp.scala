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
class ThreeJSApp extends BasicCanvas with DrawingUtils with PerlinNoise{

  Setup._3D.LeftBottom.asScene.noClear.withStats
  RectMode.leftBottom

  val perlin = Perlin(PI)

  val circles = (0 to 1000).map{ i=>
    val c =  segCircle((randomWidth, randomHeight, rand(500)), 5, 100, Palette.iDemandPancake.getRandom)
    c.rotateX(rand(PI))
    c.rotateY(rand(PI))
    c.rotateZ(rand(PI))
    c
  }

  def render():Unit = {
    circles.foreach{ c =>
      c.rotateY(0.1)
      val pos = c.position
      //pos.add(new Vector3(0,5,0).applyAxisAngle((0,0,1),perlin.noise(c.position.x*0.01, c.position.y*0.01, frameCount*0.002)))
      pos.add(vecXYAngle(PI+perlin.noise(c.position.x*0.01, c.position.y*0.01, c.position.z*0.01 + frameCount*0.002)))

      if(pos.x < 0) pos.add((width,0,0))
      if(pos.x > width) pos.add((-width,0,0))
      if(pos.y < 0) pos.add((0,height,0))
      if(pos.y > height) pos.add((0,-height,0))
    }
  }
}

//Following code must be hidden in another file

@JSExport
object App extends JSApp{

  override def main(): Unit = {

  }

  @JSExport
  def run(c:Canvas):Unit = {
    c.run()
  }
}
