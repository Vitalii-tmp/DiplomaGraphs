using diploma.Models;

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
