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
    }
}
