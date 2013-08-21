using System.Web.Mvc;

namespace Oleinikov.TopTal.ToDo.Web.Controllers
{
    public class DemoController : Controller
    {
        public ActionResult Demo()
        {
            return View();
        }

        public ActionResult ApiPlayground()
        {
            return View();
        }

        public ActionResult ApiDoc()
        {
            return View();
        }
    }
}
