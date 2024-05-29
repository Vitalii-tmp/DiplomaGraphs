﻿﻿
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
    $('.sb-suggestions').toggleClass('sb-suggestions-active'); // Показываем список при фокусе, если есть подсказки
});

$('#searchInput').on('blur', function() {
    setTimeout(function() {
        $('.sb-suggestions').toggleClass('sb-suggestions-active'); // Скрываем список при потере фокуса
    }, 200);
});

$(document).on('focus', '.search-input', function() {
    console.log('Input is focused');
    $('.rb-suggestions').toggleClass('rb-suggestions-active'); // Показываем список при фокусе, если есть подсказки
});

$(document).on('blur', '.search-input', function() {
    console.log('Input is blurred');
    var $rbSuggestions = $(this).next('.rb-suggestions');
    setTimeout(function() {
      $('.rb-suggestions').toggleClass('rb-suggestions-active'); // Скрываем список при потере фокуса
    }, 200);
});



$('.add-route-point-btn').click(function (e) {
    e.preventDefault();
    const itemCount = $('.route-builder-item').length;

    // Ограничиваем добавление до 10 элементов
    if (itemCount < 10) {
      const container = document.querySelector('.route-builder-items-container');
        const newItem = document.createElement('div');
        newItem.className = 'route-builder-item';
        newItem.innerHTML = `
          <i class="fa-solid fa-map-pin"></i>
            <div class="input-block">
                <input type="text" placeholder="Search place" class="search-input">
            </div>
            <button class="delete-point-btn"><i class="fa-regular fa-circle-xmark"></i></button>
        `;
        container.appendChild(newItem);
        // Ініціалізація автозаповнення для новододаного інпуту
        rb_autocompleteInit(newItem.querySelector('.search-input'));

    } else {
      alert('Вы можете добавить не более 10 пунктов.');
    }
});

// Обробник для видалення полів вводу
$('.route-builder-items-container').on('click', '.delete-point-btn', function(e) {
  e.preventDefault();
  $(this).closest('.route-builder-item').remove();
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

// Преобразование списка координат в формат, подходящий для Google Maps API
function convertCoordinates(coordinatesList) {
  var formattedCoordinates = [];
  for (var i = 0; i < coordinatesList.length; i++) {
    formattedCoordinates.push({
      lat: coordinatesList[i].latitude,
      lng: coordinatesList[i].longitude
    });
  }
  return formattedCoordinates;
}

// Функция для отправки списка координат на сервер и построения маршрута
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

      // Построение маршрута на карте
      // drawRoute(convertCoordinates(response));
      //
      drawMultiColoredRoute(convertCoordinates(response),colors,map);
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

$(document).ready(function(){
  // Додаємо обробник події для першого поля вводу
  $('.search-box-input').keydown(function (event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        var inputValue = $('#searchInput').val(); // Отримання значення поля вводу
        $('.route-builder .search-input:first').val(inputValue);
    }
  });
  
  // Обробник події click для кнопки пошуку
  $('.search-box-btn').click(function (e) {
    e.preventDefault();
    var inputValue = $('#searchInput').val(); // Отримання значення поля вводу
    $('.route-builder .search-input:first').val(inputValue);
  });
});