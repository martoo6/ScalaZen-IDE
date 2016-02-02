import main.lib._
import org.scalajs.dom
import org.scalajs.dom.raw.KeyboardEvent
import scala.scalajs.js.annotation.JSExport
import scala.scalajs.js.JSApp

/**
 * Antialiasing
 */

@JSExport
class ThreeJSApp extends BasicCanvas with DrawingUtils with PerlinNoise{

  Setup._2D.LeftBottom.asCanvas.noClear.withStats.antialiasing
  RectMode.leftBottom


  val circles = (0 to 1000).map{ i=>
    circle(random2D, rand(2,6), blueSaddness.getRandom)
  }

  def render():Unit = {
    val mult = map(sin(frameCount*0.01),-1,1,0.00001,0.01)
    circles.foreach{ c=>
      val pos = c.position
      pos.add((noise(pos.x*mult, pos.y*mult, frameCount*0.01),-rand(1)))
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
