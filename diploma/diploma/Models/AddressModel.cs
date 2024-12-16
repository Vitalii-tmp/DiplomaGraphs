using diploma.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.ApplicationModels;

namespace diploma.Models
{
    public class AddressModel
    {
        public string Address { get; set; }
    }
}

public class AddressCoordinatesPairModel
{
    public AddressModel Address { get; set; }
    public CoordinatesModel Coordinates { get; set; }

    //тут також повернемо відстань до наступної точки + час + сам маршрут
    public double DistanceToNextPoint { get; set; }
    public double TimeToNextPoint { get; set; }
}

public interface IAddressService
{
    Task<AddressCoordinatesPairModel[]> GetAddressCoordinatesPairsAsync(List<AddressModel> addresses);
}

public class AddressService : IAddressService
{
    private readonly ICoordinatesService _coordinatesService;

    public AddressService(ICoordinatesService coordinatesService)
    {
        _coordinatesService = coordinatesService;
    }

    public async Task<AddressCoordinatesPairModel[]> GetAddressCoordinatesPairsAsync(List<AddressModel> addresses)
    {
        var tasks = addresses.Select(async address =>
        {
            var coordinates = await _coordinatesService.GetCoordinatesAsync(address.Address);
            return new AddressCoordinatesPairModel
            {
                Address = address,
                Coordinates = coordinates
            };
        });

        return await Task.WhenAll(tasks);
    }
}