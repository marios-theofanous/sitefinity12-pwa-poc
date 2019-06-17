using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Mvc;
using System.Web.UI;
using Telerik.Sitefinity.Mvc;

namespace PWATest.Mvc.Controllers
{
    [ControllerToolboxItem(Name ="ServiceWorker", Title ="Service worker", SectionName = "Test")]
    public class ServiceWorkerController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }
    }
}