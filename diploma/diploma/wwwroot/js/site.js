//Поява миню при натичканні на кнопку
$('.menu-btn').on('click', function (e) {
    e.preventDefault();
    $('.menu').toggleClass('menu-active');
    $('.overlay').toggleClass('overlay-active');
})

//Ховання мен. при натисканні на кнопку
$('.close-menu-btn').on('click', function (e) {
    e.preventDefault();
    $('.menu').toggleClass('menu-active');
    $('.overlay').toggleClass('overlay-active');

})

//Ховання мен. при натисканні на оверлей
$('.overlay').click(function () {
    $('.overlay').toggleClass('overlay-active');
    $('.menu').toggleClass('menu-active');
});

// Показуємо підскахки при фокусі інпута в sb
$('#searchInput').on('focus', function () {
    console.log('Input is focused');
    $('.sb-suggestions').toggleClass('sb-suggestions-active');
});

// Ховаємо підсказки в sb
$('#searchInput').on('blur', function () {
    setTimeout(function () {
        $('.sb-suggestions').toggleClass('sb-suggestions-active');
    }, 200);
});

// Показуємо підскахки при фокусі інпута в rb
$(document).on('focus', '.search-input', function () {
    console.log('Input is focused');
    $('.rb-suggestions').toggleClass('rb-suggestions-active');
});

// Ховаємо підсказки в rb
$(document).on('blur', '.search-input', function () {
    console.log('Input is blurred');
    var $rbSuggestions = $(this).next('.rb-suggestions');
    setTimeout(function () {
        $('.rb-suggestions').toggleClass('rb-suggestions-active');
    }, 200);
});


//Додавання ще одного інпуту
$('.add-route-point-btn').click(function (e) {
    e.preventDefault();
    const itemCount = $('.route-builder-item').length;

    //10 елементів макс
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
$('.route-builder-items-container').on('click', '.delete-point-btn', function (e) {
    e.preventDefault();
    $(this).closest('.route-builder-item').remove();
});

//Функція при натисканні на "BUILD ROUTE"
$('.build-route-btn').click(function () {
    //Збираємо всі значення інпутів
    const routePoints = [];
    $('.route-builder-item input').each(function () {
        routePoints.push({ address: $(this).val() });
        console.log($(this).val());
    });

    // Виклик методу ajax для відправки запиту на бекенд
    sendRouteData(routePoints);
});

// Конвертування списку координат для Google Maps API
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

// Функція для відправки списку координат на сервер та побудови маршруту
function sendRouteData(routePoints) {
    console.log(routePoints);
    $.ajax({
        url: '/Coordinates/SaveAddresses',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(routePoints),
        success: function (response) {
            // Обробка успішної відповіді
            console.log('Маршрут побудовано успішно:', response);
            alert('Маршрут побудовано успішно:');

            // // Построение маршрута на карте
            // // drawRoute(convertCoordinates(response));
            // //
            const coordinates = response.map(pair => pair.coordinates);
            console.log(coordinates);

            var coordsList = [];  // Ініціалізація як порожнього масиву
            for (let i = 0; i < response.length; i++) {
              const pair = response[i];
              if (pair && pair.address && pair.coordinates) {
                  console.log(`Address: ${pair.address}`);
                  console.log(`Coordinate]: ${pair.coordinates}`);
                  coordsList.push(pair.coordinates);
              }
          }
          console.log(coordsList);
            drawMultiColoredRoute(convertCoordinates(coordsList), colors, map);
            
        },
        error: function (error) {
            // Обробка помилки
            console.error('Помилка при побудові маршруту:', error);
            alert('Помилка при побудові маршруту');
        }
    });
}

$('.route-builder-close-btn').click(function (e) {
    e.preventDefault();
    $('.route-builder').toggleClass('route-builder-active');
});


//При натисканні ENTER or search присвоюємо значення sb для першойо інпуту rb

$(document).ready(function () {
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