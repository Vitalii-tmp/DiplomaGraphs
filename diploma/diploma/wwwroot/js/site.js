

// Додавання ще одного інпуту
$('.add-point-btn').click(function (e) {
    e.preventDefault();
    const itemCount = $('.route-builder-item').length;

    // 10 елементів макс
    if (itemCount < 10) {
        const container = document.querySelector('.inputs');
        const newItem = document.createElement('div');
        newItem.className = 'route-builder-item';
        newItem.innerHTML = `
        <div class="route-builder-item-input-box">
            <span>-></span>
            <input class="search-input" placeholder="Add a destination" type="text" class="route-input" autocomplete="off">
        </div>
        <ul class="sb-suggestions">
            <li>Вводьте адресу а я вам допоможу)))</li>
        </ul>
        `;
        container.appendChild(newItem);
        
        // Ініціалізація автозаповнення для новододаного інпуту
        var input = newItem.querySelector('input');
        var suggestionsList = newItem.querySelector('.sb-suggestions');
        rb_autocompleteInit(input, suggestionsList );
    } else {
        alert('Вы можете добавить не более 10 пунктов.');
    }
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
            // const coordinates = response.map(pair => pair.coordinates);
            // console.log(coordinates);

            var coordsList = [];  // Ініціалізація як порожнього масиву
            for (let i = 0; i < response.length; i++) {
                const pair = response[i];
                if (pair && pair.address && pair.coordinates) {
                  
                    coordsList.push(pair.coordinates);
                }
            }
            
            drawMultiColoredRoute(convertCoordinates(coordsList), colors, map);

            const inputs = document.querySelectorAll('.search-input');
            
            // Перебираємо інпути і зберігаємо їх значення в масив
            

            for (let i = 0; i < inputs.length; i++) {
                inputs[i].value = response[i].address.address;
            }


        },
        error: function (error) {
            // Обробка помилки
            console.error('Помилка при побудові маршруту:', error);
            alert('Помилка при побудові маршруту');
        }
    });
}



//При натисканні ENTER or search присвоюємо значення sb для першойо інпуту rb

// $(document).on('focus', '#start-point', function () {
//     console.log('Input is focused');
//     $('.rb-suggestions').toggleClass('rb-suggestions-active');
// });

$(document).on('focus', '#startPoint', function () {
    console.log('Input is focused');
    if ($('#startPoint').val() === '') {
        $('.info').toggleClass('info-active');
    }
    $('.info').html('<h1>Build a route:</h1><p></p>');
});

$(document).on('input', '#startPoint', function () {
    if ($(this).val() !== '') {
        $('.info').html('<h1>Build a route:</h1><p></p>');
        $(this).closest('.route-builder-item').find('.sb-suggestions').addClass('show');
    } else {
        $(this).closest('.route-builder-item').find('.sb-suggestions').removeClass('show');
    }
});

$(document).on('blur', '#startPoint', function () {
    var $this = $(this);

    setTimeout(function () {
        if ($('#startPoint').val() === '') {
            $('.info').toggleClass('info-active');
            $('.info').html('<span><img src="img/icon1_black.svg" alt="Icon"></span><h1>BriskRoute</h1><p>The fastest way to deliver your packages.</p>');
        }
        $this.closest('.route-builder-item').find('.sb-suggestions').removeClass('show');
    }, 100);
});

$(document).on('input', '.search-input', function () {
    if ($(this).val() !== '') {
        $(this).closest('.route-builder-item').find('.sb-suggestions').addClass('show');
    } else {
        $(this).closest('.route-builder-item').find('.sb-suggestions').removeClass('show');
    }
});

$(document).on('focus', '.search-input', function () {
    if ($(this).val() !== '') {
        $(this).closest('.route-builder-item').find('.sb-suggestions').addClass('show');
    } else {
        $(this).closest('.route-builder-item').find('.sb-suggestions').removeClass('show');
    }
});

$(document).on('blur', '.search-input', function () {
    var $this = $(this);

    setTimeout(function () {
        $this.closest('.route-builder-item').find('.sb-suggestions').removeClass('show');
    }, 100);
});

