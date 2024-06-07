using Newtonsoft.Json.Linq;

namespace diploma.Models
{
    public static class DistanceService
    {

        public static double GetDistance(CoordinatesModel coord1, CoordinatesModel coord2)
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

        public static async Task<double> GetDistanceByRoadAsync(CoordinatesModel coord1, CoordinatesModel coord2)
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
        public static async Task<double> GetShortestDistanceByRoadAsync(CoordinatesModel coord1, CoordinatesModel coord2)
        {
            var apiKey = "AIzaSyAdNqLjq5sBbA9n2dAJNFcLsKdhw50zerw";
            var url = $"https://maps.googleapis.com/maps/api/directions/json?origin={coord1.Latitude},{coord1.Longitude}&destination={coord2.Latitude},{coord2.Longitude}&alternatives=true&key={apiKey}";

            using (var client = new HttpClient())
            {
                var response = await client.GetStringAsync(url);
                var json = JObject.Parse(response);

                if (json["status"].ToString() == "OK")
                {
                    double shortestDistance = double.MaxValue;

                    foreach (var route in json["routes"])
                    {
                        var distanceInMeters = route["legs"][0]["distance"]["value"].ToObject<double>();
                        if (distanceInMeters < shortestDistance)
                        {
                            shortestDistance = distanceInMeters;
                        }
                    }

                    // Відстань в км
                    var distanceInKilometers = shortestDistance / 1000;
                    return distanceInKilometers;
                }
                else
                {
                    throw new Exception($"API returned error status: {json["status"]}");
                }
            }


        }
    }
}
