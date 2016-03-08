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
  Setup._3D.Center.asScene.noClear.withStats.withControls

  addAmbientLight(0xFFFFFF)
  addDirectionalLight(0xFFFFFF, 0.9, (0,1,0))

  val n1 = Simplex(-250,250)
  val n2 = Simplex(-250,250)
  val n3 = Simplex(-250,250)

  dom.onkeypress = {e:KeyboardEvent => saveImg}

  def render():Unit = {
    if(frameCount < 60*10) {
      val size = rand(2,5)
      stroke(Palette.iDemandPancake.getRandom, size*2)

      val fc = frameCount*0.02

      val x = n1.noise(fc)
      val y = n2.noise(fc)
      val z = n3.noise(fc)

      val dest = (x,y,z)

      line(center,dest)
      segSphere(dest, size, 5, Palette.iDemandPancake.getRandom.materializeL())
    }
  }
}
