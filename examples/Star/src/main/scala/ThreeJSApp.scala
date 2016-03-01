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
  Setup._3D.Center.asScene.autoClear

  stroke(0xFFFFFF)

  def render():Unit = {
    val div = mouseX.map(0,width,5,20).toInt

    val lst = (1 to div).map(_*TWO_PI/div).toList ::: (1 to div).map(_*TWO_PI/div).toList.take(div)
    val m = new LineDashedMaterial()
    m.color.setRGB(1,0,1)
    for(x<-lst.sliding(div+1); y<-x.drop(1)){
        line((sin(x.head)*200, cos(x.head)*200), (sin(y)*200, cos(y)*200), m)
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
