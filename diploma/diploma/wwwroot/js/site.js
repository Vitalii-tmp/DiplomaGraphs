//поява меню
$('.menu-btn').on('click', function (e) {
    e.preventDefault();
    $('.menu').toggleClass('menu-active');
    $('.overlay').toggleClass('overlay-active');
})

//закривання меню
$('.close-menu-btn').on('click', function (e) {
    e.preventDefault();
    $('.menu').toggleClass('menu-active');
    $('.overlay').toggleClass('overlay-active');

})

//закривання меню при натисканні на оверлей
$('.overlay').click(function () {
    $('.overlay').toggleClass('overlay-active');
    $('.menu').toggleClass('menu-active');
});

//Показуєио підсказки коли searchBox в фокусі
$('#searchInput').on('focus', function () {
    console.log('Input is focused');
    $('.sb-suggestions').toggleClass('sb-suggestions-active');
});

//Ховаємо підсказки коли searchBox в фокусі
$('#searchInput').on('blur', function () {
    setTimeout(function () {
        $('.sb-suggestions').toggleClass('sb-suggestions-active'); // Скрываем список при потере фокуса
    }, 200);
});

//Показуєио підсказки коли RouteBuilder в фокусі
$(document).on('focus', '.search-input', function () {
    console.log('Input is focused');
    $('.rb-suggestions').toggleClass('rb-suggestions-active');
});

//Ховаємо підсказки коли RouteBuilder в фокусі
$(document).on('blur', '.search-input', function () {
    console.log('Input is blurred');
    var $rbSuggestions = $(this).next('.rb-suggestions');
    setTimeout(function () {
        $('.rb-suggestions').toggleClass('rb-suggestions-active'); // Скрываем список при потере фокуса
    }, 200);
});

//Додавання поля пошуку в RouteBuilder
$('.add-route-point-btn').click(function (e) {
    e.preventDefault();
    const itemCount = $('.route-builder-item').length;

    // 10 елементів максимум
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

//Обробник для побудови маршруту
$('.build-route-btn').click(function () {
    // Збираємо значення зі всіх інпутів
    const routePoints = [];
    $('.route-builder-item input').each(function () {
        routePoints.push({ address: $(this).val() });
        // console.log($(this).val());
    });
    //тут збережемо список того що ввели

    // Відправляємо дані на бекенд для обрахунку та виводимо все необхідне назад
    sendRouteData(routePoints);
});

// Перетворення списку координат на формат, що підходить для Google Maps API
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

// Функція для надсилання списку координат на сервер та побудови маршруту
function sendRouteData(routePoints) {
    console.log(routePoints);
    $.ajax({
        url: '/Coordinates/SaveAddresses',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(routePoints),
        success: function (response) {
            // Обробка успішної відповіді від бекенда
            console.log('Маршрут успешно построен:', response);
            alert('Маршрут успешно построен');

            //тут виведемо адреси які прийшли в response

            
            
            //будуємо маршрут
            drawMultiColoredRoute(convertCoordinates(response), colors, map);
        },
        error: function (error) {
            // Обробка помилки
            console.error('Ошибка при построении маршрута:', error);
            alert('Ошибка при построении маршрута');
        }
    });
}

//закрити routebuilder
$('.route-builder-close-btn').click(function (e) {
    e.preventDefault();
    $('.route-builder').toggleClass('route-builder-active');
});

//При натисканні пошуку передаємо значення інпуту в перший інпут routebuilder-у
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


