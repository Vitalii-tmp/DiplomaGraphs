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
                var distance = GetDistance(coordinatesList[0], coordinatesList[1]);
                var roadDistance = await GetDistanceByRoadAsync(coordinatesList[0], coordinatesList[1]);
                Console.WriteLine($"Расстояние между первой и второй точками: {distance} км");
                var fakeCoords = new CoordinatesModel { Latitude = distance, Longitude = roadDistance };
                
                coordinatesList.Add(fakeCoords);
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

        

        private double GetDistance(CoordinatesModel coord1, CoordinatesModel coord2)
        {
            const double R = 6371; // Радиус Земли в километрах

            var lat = (coord2.Latitude - coord1.Latitude) * (Math.PI / 180);
            var lng = (coord2.Longitude - coord1.Longitude) * (Math.PI / 180);

            var h1 = Math.Sin(lat / 2) * Math.Sin(lat / 2) +
                     Math.Cos(coord1.Latitude * (Math.PI / 180)) * Math.Cos(coord2.Latitude * (Math.PI / 180)) *
                     Math.Sin(lng / 2) * Math.Sin(lng / 2);

            var h2 = 2 * Math.Atan2(Math.Sqrt(h1), Math.Sqrt(1 - h1));

            var distance = R * h2;

            return distance;
        }

        private async Task<double> GetDistanceByRoadAsync(CoordinatesModel coord1, CoordinatesModel coord2)
        {
            var apiKey = "AIzaSyAdNqLjq5sBbA9n2dAJNFcLsKdhw50zerw";
            var url = $"https://maps.googleapis.com/maps/api/directions/json?origin={coord1.Latitude},{coord1.Longitude}&destination={coord2.Latitude},{coord2.Longitude}&key={apiKey}";

            using (var client = new HttpClient())
            {
                var response = await client.GetStringAsync(url);
                var json = JObject.Parse(response);

                if (json["status"].ToString() == "OK")
                {
                    var distanceInMeters = json["routes"][0]["legs"][0]["distance"]["value"].ToObject<double>();
                    // Відстань в км
                    var distanceInKilometers = distanceInMeters / 1000;
                    return distanceInKilometers;
                }
                else
                {
                    return 0;
                }
            }
        }
    }
}
