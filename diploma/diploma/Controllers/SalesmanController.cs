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
    private List<Dictionary<string, CoordinatesModel>> addressCoordinatesList;
    private int numPoints;
    private double[,] distanceMatrix;
    private double bestCost;
    private List<int> bestPath;

    public TSPSolver(List<Dictionary<string, CoordinatesModel>> addressCoordinatesList)
    {
        this.addressCoordinatesList = addressCoordinatesList;
        this.numPoints = addressCoordinatesList.Count;
        this.distanceMatrix = new double[numPoints, numPoints];
        CalculateDistanceMatrix();
    }

    private void CalculateDistanceMatrix()
    {
        var coordinatesList = addressCoordinatesList.SelectMany(dict => dict.Values).ToList();

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
                    distanceMatrix[i, j] = DistanceController.GetDistance(coordinatesList[i], coordinatesList[j]);
                }
            }
        }
    }

    public List<Dictionary<string, CoordinatesModel>> FindShortestPath()
    {
        bestCost = double.MaxValue;
        bestPath = new List<int>();

        List<int> currentPath = new List<int> { 0 };
        bool[] visited = new bool[numPoints];
        visited[0] = true;

        BranchAndBound(currentPath, visited, 0);

        return bestPath.Select(index => addressCoordinatesList[index]).ToList();
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
