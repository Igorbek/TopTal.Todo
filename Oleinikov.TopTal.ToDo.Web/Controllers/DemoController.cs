using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Oleinikov.TopTal.ToDo.Web.Controllers
{
    public class DemoController : Controller
    {
        //
        // GET: /Demo/

        public ActionResult Demo()
        {
            return View();
        }

        public ActionResult ApiPlayground()
        {
            return View();
        }

    }
}
