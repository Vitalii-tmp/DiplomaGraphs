using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using diploma.Models;
using GoogleMapsApi;
using GoogleMapsApi.Entities.Common;
using GoogleMapsApi.Entities.Geocoding.Request;
using GoogleMapsApi.Entities.Geocoding.Response;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json.Linq;


namespace diploma.Controllers
{
    public class CoordinatesController : Controller
    {

        //асинхронна функція яка зберігає координати

        private readonly IAddressService _addressService;
        private readonly ITSPSolverService _tspSolverService;

        public CoordinatesController(IAddressService addressService, ITSPSolverService tspSolverService)
        {
            _addressService = addressService;
            _tspSolverService = tspSolverService;
        }

        [HttpPost]
        public async Task<ActionResult<List<AddressCoordinatesPairModel>>> SaveAddresses([FromBody] List<AddressModel> addresses)
        {
            var addressCoordinatesPairs = await _addressService.GetAddressCoordinatesPairsAsync(addresses);

            // Виключення пар з null координатами
            var filteredPairs = addressCoordinatesPairs.Where(pair => pair.Coordinates != null).ToList();

            var optimalRoute = await _tspSolverService.FindShortestPathAsync(filteredPairs);

            return Ok(optimalRoute);
        }

        [HttpPost]
        public ActionResult Save(double latitude, double longitude)
        {

            return Json(new { success = true, message = "Перевірка" });
        }


        // метод геокодування з адреси в координати
        //private async Task<CoordinatesModel> GetCoordinatesAsync(string address)
        //{
        //    var apiKey = "AIzaSyAdNqLjq5sBbA9n2dAJNFcLsKdhw50zerw";

        //    var request = new GeocodingRequest
        //    {
        //        Address = address,
        //        ApiKey = apiKey
        //    };
        //    // запит до гугла з геокодуванням
        //    GeocodingResponse response = await GoogleMaps.Geocode.QueryAsync(request);

        //    if (response.Status == GoogleMapsApi.Entities.Geocoding.Response.Status.OK && response.Results.Any())
        //    {
        //        var location = response.Results.First().Geometry.Location;
        //        return new CoordinatesModel { Latitude = location.Latitude, Longitude = location.Longitude };
        //    }
        //    else
        //    {
        //        return null;
        //    }
        //}




    }
}