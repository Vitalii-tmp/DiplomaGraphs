namespace diploma.Models
{
    public class GoogleDistanceMatrixResponse
    {
        public List<Row> rows { get; set; }
    }

    public class Row
    {
        public List<Element> elements { get; set; }
    }

    public class Element
    {
        public Distance distance { get; set; }
        public Duration duration { get; set; }
    }

    public class Distance
    {
        public string text { get; set; }
        public int value { get; set; }
    }

    public class Duration
    {
        public string text { get; set; }
        public int value { get; set; }
    }

    public class DistanceResult
    {
        public string Origin { get; set; }
        public string Destination { get; set; }
        public string DistanceText { get; set; }
        public int DistanceValue { get; set; }
        public string DurationText { get; set; }
        public int DurationValue { get; set; }
    }
}
