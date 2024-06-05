using GoogleMapsApi.Entities.Geocoding.Request;
using GoogleMapsApi.Entities.Geocoding.Response;
using GoogleMapsApi;
using System.Threading.Tasks;
namespace diploma.Models
{
    public class CoordinatesModel
    {
        public double Latitude { get; set; }
        public double Longitude { get; set; }
    }



    public interface ICoordinatesService
    {
        Task<CoordinatesModel> GetCoordinatesAsync(string address);
    }

    public class CoordinatesService : ICoordinatesService
    {
        public async Task<CoordinatesModel> GetCoordinatesAsync(string address)
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
