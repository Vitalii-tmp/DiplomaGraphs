using diploma.Models;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace diploma.Controllers
{
    // Клас для обчислення TSP
    public class TSPSolver
    {
        private List<CoordinatesModel> coordinates;
        private int numPoints;
        private double[,] distanceMatrix;
        private double bestCost;
        private List<int> bestPath;

        public TSPSolver(List<CoordinatesModel> coordinates)
        {
            this.coordinates = coordinates;
            this.numPoints = coordinates.Count;
            this.distanceMatrix = new double[numPoints, numPoints];
        }


        // рахуємо матрицю усміжностей, для оптимізації використав метод паралельних задач
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
                            distanceMatrix[iCopy, jCopy] = await DistanceController.GetDistanceByRoadAsync(coordinates[iCopy], coordinates[jCopy]);
                        }));
                    }
                }
            }

            await Task.WhenAll(tasks);
        }


        public async Task<List<CoordinatesModel>> FindShortestPathAsync()
        {
            bestCost = double.MaxValue;
            bestPath = new List<int>();

            await CalculateDistanceMatrixAsync();

            List<int> currentPath = new List<int> { 0 };
            bool[] visited = new bool[numPoints];
            visited[0] = true;

            BranchAndBound(currentPath, visited, 0);

            return bestPath.Select(index => coordinates[index]).ToList();
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
