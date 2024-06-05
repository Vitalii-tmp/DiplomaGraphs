
using diploma.Controllers;
using System.Collections.Generic;
using System.Threading.Tasks;
namespace diploma.Models
{
    public interface ITSPSolverService
    {
        Task<List<AddressCoordinatesPair>> FindShortestPathAsync(List<AddressCoordinatesPair> addressCoordinatesPairs);
    }

    public class TSPSolverService : ITSPSolverService
    {
        private List<AddressCoordinatesPair> addressCoordinatesPairs;
        private int numPoints;
        private double[,] distanceMatrix;
        private double bestCost;
        private List<int> bestPath;

        public async Task<List<AddressCoordinatesPair>> FindShortestPathAsync(List<AddressCoordinatesPair> addressCoordinatesPairs)
        {
            this.addressCoordinatesPairs = addressCoordinatesPairs;
            this.numPoints = addressCoordinatesPairs.Count;
            this.distanceMatrix = new double[numPoints, numPoints];

            bestCost = double.MaxValue;
            bestPath = new List<int>();

            await CalculateDistanceMatrixAsync();

            List<int> currentPath = new List<int> { 0 };
            bool[] visited = new bool[numPoints];
            visited[0] = true;

            BranchAndBound(currentPath, visited, 0);

            // Повертаємо оптимальний маршрут в форматі адрес-координат
            return bestPath.Select(index => addressCoordinatesPairs[index]).ToList();
        }

        // Рахуємо матрицю відстаней, використовуючи адреси-координати
        private async Task CalculateDistanceMatrixAsync()
        {
            var tasks = new List<Task>();

            for (int i = 0; i < numPoints; i++)
            {
                for (int j = 0; j < numPoints; j++)
                {
                    if (i == j)
                    {
                        distanceMatrix[i, j] = double.MaxValue;
                    }
                    else
                    {
                        int iCopy = i, jCopy = j;
                        tasks.Add(Task.Run(async () =>
                        {
                            distanceMatrix[iCopy, jCopy] = await DistanceService.GetDistanceByRoadAsync(addressCoordinatesPairs[iCopy].Coordinates, addressCoordinatesPairs[jCopy].Coordinates);
                        }));
                    }
                }
            }

            await Task.WhenAll(tasks);
        }

        private void BranchAndBound(List<int> currentPath, bool[] visited, double currentCost)
        {
            if (currentPath.Count == numPoints)
            {
                currentCost += distanceMatrix[currentPath.Last(), currentPath[0]];
                if (currentCost < bestCost)
                {
                    bestCost = currentCost;
                    bestPath = new List<int>(currentPath) { 0 };
                }
                return;
            }

            for (int i = 0; i < numPoints; i++)
            {
                if (!visited[i])
                {
                    double newCost = currentCost + distanceMatrix[currentPath.Last(), i];
                    if (newCost < bestCost)
                    {
                        visited[i] = true;
                        currentPath.Add(i);
                        BranchAndBound(currentPath, visited, newCost);
                        visited[i] = false;
                        currentPath.RemoveAt(currentPath.Count - 1);
                    }
                }
            }
        }
    }
}
