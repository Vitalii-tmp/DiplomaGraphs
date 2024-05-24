
 $('.menu-btn').on('click', function (e) {
    e.preventDefault();
    $('.menu').toggleClass('menu-active');
    $('.overlay').toggleClass('overlay-active');
})

$('.close-menu-btn').on('click', function (e) {
    e.preventDefault();
    $('.menu').toggleClass('menu-active');
    $('.overlay').toggleClass('overlay-active');

})

$('.overlay').click(function () {
    $('.overlay').toggleClass('overlay-active');
    $('.menu').toggleClass('menu-active');
});

$('#searchInput').on('focus', function() {
    console.log('Input is focused');
    $('.suggestions').toggleClass('suggestions-active'); // Показываем список при фокусе, если есть подсказки
});

$('#searchInput').on('blur', function() {
    setTimeout(function() {
        $('.suggestions').toggleClass('suggestions-active'); // Скрываем список при потере фокуса
    }, 200);
});


$('.add-route-point-btn').click(function (e) {
    e.preventDefault();
    const itemCount = $('.route-builder-item').length;

    // Ограничиваем добавление до 10 элементов
    if (itemCount < 10) {
      // Клонируем последний элемент route-builder-item
      const newRouteItem = $('.route-builder-item').last().clone();

      // Очищаем введенные данные в клонированном элементе
      newRouteItem.find('input').val('');

      // Добавляем новый элемент внутрь контейнера
      $('.route-builder-items-container').append(newRouteItem);
    } else {
      alert('Вы можете добавить не более 10 пунктов.');
    }

});

$('.build-route-btn').click(function() {
    // Собираем все значения из инпутов
    const routePoints = [];
    $('.route-builder-item input').each(function() {
        routePoints.push({ address: $(this).val() });
      console.log($(this).val());
    });

    // Вызов метода AJAX для отправки данных на бэкенд
    sendRouteData(routePoints);
  });

function sendRouteData(routePoints) {
    console.log(routePoints);
    $.ajax({
        
      url: '/Coordinates/SaveAddresses', // Убедитесь, что URL корректный
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(routePoints),
      success: function(response) {
        // Обработка успешного ответа от бэкенда
        console.log('Маршрут успешно построен:', response);
        alert('Маршрут успешно построен');
      },
      error: function(error) {
        // Обработка ошибки
        console.error('Ошибка при построении маршрута:', error);
        alert('Ошибка при построении маршрута');
      }
    });
  }

  $('.route-builder-close-btn').click(function (e) {
    e.preventDefault();
    $('.route-builder').toggleClass('route-builder-active');
});


