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
        public async Task<ActionResult<List<CoordinatesModel>>> SaveAddresses([FromBody] List<AddressModel> addresses)
        {
            var coordinatesList = new List<CoordinatesModel>();
            
            foreach (var address in addresses)
            {
                var coordinates = await GetCoordinatesAsync(address.Address);
                if (coordinates != null)
                {
                    coordinatesList.Add(coordinates);
                }
            }

            
            if (coordinatesList.Count >= 2)
            {
                var distance = DistanceController.GetDistance(coordinatesList[0], coordinatesList[1]);
                // var roadDistance = await DistanceController.GetDistanceByRoadAsync(coordinatesList[0], coordinatesList[1]);
                Console.WriteLine($"Расстояние между первой и второй точками: {distance} км");
                // var fakeCoords = new CoordinatesModel { Latitude = distance, Longitude = roadDistance };
                
                // coordinatesList.Add(fakeCoords);
            }
            
            return coordinatesList;
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
