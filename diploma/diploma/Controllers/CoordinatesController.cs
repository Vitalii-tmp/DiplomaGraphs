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

        [HttpPost]
        public ActionResult Save(double latitude, double longitude)
        {
            // Здесь вы можете сохранить координаты в базе данных или выполнить другие операции с ними
            // Возвращаем успешный результат клиенту
            return Json(new { success = true, message = "Перевірка" });
        }

        //асинхронна функція яка зберігає координати

        [HttpPost]
        public async Task<ActionResult<List<AddressCoordinatesPair>>> SaveAddresses([FromBody] List<AddressModel> addresses)
        {
            var tasks = addresses.Select(async address =>
            {
                var coordinates = await GetCoordinatesAsync(address.Address);
                return new AddressCoordinatesPair
                {
                    Address = address,
                    Coordinates = coordinates
                };
            });

            var addressCoordinatesPairs = await Task.WhenAll(tasks);

            // Виключення пар з null координатами
            var filteredPairs = addressCoordinatesPairs.Where(pair => pair.Coordinates != null).ToList();

            var tspSolver = new TSPSolver(filteredPairs);

            // Виклик методу FindShortestPathAsync
            var optimalRoute = await tspSolver.FindShortestPathAsync();

            return Ok(optimalRoute);
        }




        // метод геокодування з адреси в координати
        private async Task<CoordinatesModel> GetCoordinatesAsync(string address)
        {
            var apiKey = "AIzaSyAdNqLjq5sBbA9n2dAJNFcLsKdhw50zerw";

            var request = new GeocodingRequest
            {
                Address = address,
                ApiKey = apiKey
            };
            // запит до гугла з геокодуванням
            GeocodingResponse response = await GoogleMaps.Geocode.QueryAsync(request);

            if (response.Status == GoogleMapsApi.Entities.Geocoding.Response.Status.OK && response.Results.Any())
            {
                var location = response.Results.First().Geometry.Location;
                return new CoordinatesModel { Latitude = location.Latitude, Longitude = location.Longitude };
            }
            else
            {
                return null;
            }
        }




    }
}