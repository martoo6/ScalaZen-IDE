import main.lib._
import org.scalajs.dom
import org.scalajs.dom.raw.KeyboardEvent
import scala.scalajs.js.annotation.JSExport
import scala.scalajs.js.JSApp

/**
 */

@JSExport
class ThreeJSApp extends BasicCanvas with DrawingUtils with SimplexNoise with StatsDisplay {
  Setup._2D.LeftBottom.asScene


  val data = for{
    x <- 0 until width
    y <- 0 until height
  } yield (new Vector3(x,y,0), new Color(((x+y*height)*0.01)%1,0,0))

  val geo = point2(data:_*).geometry

  def render():Unit = {
    val rr = iDemandPancake.getRandom

    for(i <- (0 until geo.colors.size-10 by rand(50,100).toInt).flatMap(x=> x to x + rand(10).toInt)){
    //for(i <- 0 until geo.colors.size by random(40).toInt){
      geo.colors(i).setRGB(rr.r, rr.g, rr.b)
    }
    geo.colorsNeedUpdate=true
  }
}
