// Додавання ще одного інпуту
$('.add-point-btn').click(function (e) {
    e.preventDefault();
    const itemCount = $('.route-builder-item').length;

    // 8 елементів макс
    if (itemCount < 8) {
        const container = document.querySelector('.inputs');
        const newItem = document.createElement('div');
        newItem.className = 'route-builder-item';
        newItem.innerHTML = `
        <div class="route-builder-item-input-box">
             <span>-></span>
            <input class="search-input" placeholder="Add a destination" type="text" id="finishPoint" autocomplete="off">
        </div>
            <ul class="sb-suggestions">
                <li>Вводьте адресу а я вам допоможу)))</li>
            </ul>
        <span class="delete-item-btn">+</span>
        `;
        container.appendChild(newItem);

        // Ініціалізація автозаповнення для новододаного інпуту
        var input = newItem.querySelector('.search-input');
        var suggestionsList = newItem.querySelector('.sb-suggestions');

        rb_autocompleteInit(input, suggestionsList, 'uk'); // Для української
        rb_autocompleteInit(input, suggestionsList, 'en'); // Для англійської

    } else {
        alert('Sorry/ 8 stops max!)');
    }
});

$(document).ready(function () {
    // Додати обробник події до всіх існуючих кнопок видалення
    $('.route-builder').on('click', '.delete-item-btn', function () {
        // Видалити відповідний батьківський елемент route-builder-item
        $(this).closest('.route-builder-item').remove();
    });

    // При наведенні на кнопку видалення
    $('.route-builder').on('mouseenter', '.route-builder-item', function () {
        $(this).find('.delete-item-btn').addClass('delete-item-btn-active');
    });

    // При виході миші з кнопки видалення
    $('.route-builder').on('mouseleave', '.route-builder-item', function () {
        $(this).find('.delete-item-btn').removeClass('delete-item-btn-active');
    });

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

function switchMap() {
    $('.main-wrapper').toggleClass("main-wrapper-hide")
    $('.main').toggleClass("main-active")
}

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
            // alert('Маршрут побудовано успішно:');



            var coordsList = [];  // Ініціалізація як порожнього масиву
            let stopsAddresses = [];
            for (let i = 0; i < response.length; i++) {
                const pair = response[i];
                if (pair && pair.address && pair.coordinates) {
                    coordsList.push(pair.coordinates);
                    stopsAddresses.push(pair.address.address);
                }
            }

            drawMultiColoredRoute(convertCoordinates(coordsList), colors, map);


            // Перевірка стану побудови напрямків
            const checkInterval = setInterval(() => {
                if (checkDirectionsRenderers()) {
                    clearInterval(checkInterval); // Зупиняємо перевірку, якщо всі напрямки побудовані
                    updateEstimates(); // Оновлюємо оцінки
                    currentSegmentIndex = 0;
                    //записуємо значення в список зупинок
                    document.querySelector('.stops-nums').textContent = '0' + stopsAddresses.length + ' stops';
                    const stopPointInfoItems = document.querySelectorAll('.full-info ul li');
                    for (let i = 0; i < stopPointInfoItems.length; i++) {
                        if (i < stopsAddresses.length) {
                            var itemNumber = '0' + (i+1);
                            var itemText = stopsAddresses[i];

                            stopPointInfoItems[i].querySelector('p').textContent = itemText;
                            stopPointInfoItems[i].querySelector('span').textContent = itemNumber;
                        }
                        else {
                            stopPointInfoItems[i].querySelector('p').textContent = '';
                            stopPointInfoItems[i].querySelector('span').textContent = '';
                        }
                    }


                    switchMap();


                }
            }, 500); // Інтервал перевірки, можна налаштувати відповідно до потреби

            //перезаписуємо поля попорядку щоб були
            const inputs = document.querySelectorAll('.search-input');

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

// -- ПІДСКАЗКИ --

// Якщо в фокусі перше меню міняємо напис зверху
$(document).on('focus', '#startPoint', function () {
    console.log('Input is focused');
    if ($('#startPoint').val() === '') {
        $('.info').toggleClass('info-active');
    }
    $('.info').html('<h1>Build a route:</h1><p></p>');
});

// Показуємо підсказки якщо користувач щось пише а ні то видаляємо для #startPoint
$(document).on('input', '#startPoint', function () {
    if ($(this).val() !== '') {
        $('.info').html('<h1>Build a route:</h1><p></p>');
    }
    $(this).closest('.route-builder-item').find('.sb-suggestions').toggleClass('show', $(this).val() !== '');
});

// Коли користувач не на інпуті видаляємо підсказки та оновлюємо .info для #startPoint
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

// Показуємо підсказки якщо користувач щось пише а ні то видаляємо для всіх .search-input
$(document).on('input', '.search-input', function () {
    $(this).closest('.route-builder-item').find('.sb-suggestions').toggleClass('show', $(this).val() !== '');
});

// Коли користувач не на інпуті видаляємо підсказки для всіх .search-input
$(document).on('blur', '.search-input', function () {
    var $this = $(this);
    setTimeout(function () {
        $this.closest('.route-builder-item').find('.sb-suggestions').removeClass('show');
    }, 100);
});

// Показуємо підсказки якщо користувач фокусує поле, для всіх .search-input
$(document).on('focus', '.search-input', function () {
    $(this).closest('.route-builder-item').find('.sb-suggestions').toggleClass('show', $(this).val() !== '');
});

$(document).on('click', '#back-to-main-btn', function () {
    switchMap();
});

// --FULL INFO (STOPS)-- //
$(document).ready(function () {
    $('#viewDetailsBtn').on('click', function (event) {
        event.preventDefault(); // запобігає переходу за посиланням
        $('.full-route-details-container').toggleClass('full-route-details-container-active');

        // Тут можна додати додаткові дії, які потрібно виконати при натисканні
        var $this = $(this);
        if ($this.text() === 'View Details') {
            $this.text('Hide');
        } else {
            $this.text('View Details');
        }
    });
});

