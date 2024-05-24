using diploma.Models;
using Microsoft.AspNetCore.Mvc;

namespace diploma.Controllers
{
    public class CoordinatesController : Controller
    {
        [HttpPost]
        public ActionResult Save(double latitude, double longitude)
        {
            // Здесь вы можете сохранить координаты в базе данных или выполнить другие операции с ними
            // Возвращаем успешный результат клиенту
            return Json(new { success = true, message = "Координаты успешно сохраненыffff" });
        }

        public ActionResult SaveAddresses([FromBody] List<AddressModel> addresses)
        {

            // Логируем список адресов в консоль
            foreach (var address in addresses)
            {
                System.Console.WriteLine($"Address: {address.Address}");
            }

            // Возвращаем успешный результат клиенту
            return Json(new { success = true, message = addresses });
        }
    }
}
