using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Mvc;
using Telerik.Sitefinity.Mvc;

namespace PWATest.Mvc.Controllers
{
    [ControllerToolboxItem(Name = "Offline bar", Title = "Offline bar", SectionName = "Test")]
    public class OfflineBarController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }
    }
}