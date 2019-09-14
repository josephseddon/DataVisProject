using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using DataVisProject.Models;

namespace DataVisProject.Controllers
{
    public class HomeController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }


        public IActionResult About()
        {
            ViewData["Message"] = "Your application description page.";

            return View();
        }

        public IActionResult Survey()
        {
            ViewData["Message"] = "Survey page";

            return View();
        }

        public IActionResult Surveybig()
        {
            ViewData["Message"] = "Survey page";

            return View();
        }

        public IActionResult Surveywithcheck()
        {
            ViewData["Message"] = "Survey page with selectable columns";

            return View();
        }

        public IActionResult Surveybasicfilter()
        {
            ViewData["Message"] = "Survey with basic filter";

            return View();
        }

        public IActionResult Surveybasicfilterdropdown()
        {
            ViewData["Message"] = "Survey with basic filter and dropdown test";

            return View();
        }

        public IActionResult Surveycomplexfilter()
        {
            ViewData["Message"] = "Survey with complex filter";

            return View();
        }

        public IActionResult Surveyfiltervertical()
        {
            ViewData["Message"] = "Survey with complex filter";

            return View();
        }

        public IActionResult Surveystyleupdate()
        {
            ViewData["Message"] = "Survey with complex filter";

            return View();
        }

        public IActionResult Sandbox()
        {
            ViewData["Message"] = "Survey with basic filter";

            return View();
        }

        public IActionResult Contact()
        {
            ViewData["Message"] = "Your contact page.";

            return View();
        }

        public IActionResult Privacy()
        {
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
