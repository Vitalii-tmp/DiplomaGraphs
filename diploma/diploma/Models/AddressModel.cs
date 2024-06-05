using diploma.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace diploma.Models
{
    public class AddressModel
    {
        public string Address { get; set; }
    }
}

public class AddressCoordinatesPair
{
    public AddressModel Address { get; set; }
    public CoordinatesModel Coordinates { get; set; }
}

public interface IAddressService
{
    Task<AddressCoordinatesPair[]> GetAddressCoordinatesPairsAsync(List<AddressModel> addresses);
}

public class AddressService : IAddressService
{
    private readonly ICoordinatesService _coordinatesService;

    public AddressService(ICoordinatesService coordinatesService)
    {
        _coordinatesService = coordinatesService;
    }

    public async Task<AddressCoordinatesPair[]> GetAddressCoordinatesPairsAsync(List<AddressModel> addresses)
    {
        var tasks = addresses.Select(async address =>
        {
            var coordinates = await _coordinatesService.GetCoordinatesAsync(address.Address);
            return new AddressCoordinatesPair
            {
                Address = address,
                Coordinates = coordinates
            };
        });

        return await Task.WhenAll(tasks);
    }
}