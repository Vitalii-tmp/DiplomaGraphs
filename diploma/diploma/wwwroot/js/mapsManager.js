let map;
let markers = [];

function initMap() {
    // Создание карты, центрированной на заданных координатах (Сидней, Австралия)
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: -33.8688, lng: 151.2195 },
        zoom: 13
    });

    autocompleteInit();
}

function autocompleteInit(){
    var autocompleteService = new google.maps.places.AutocompleteService();
    var input = document.getElementById('searchInput');
    var suggestionsList = document.getElementById('suggestions');

    input.addEventListener('input', function() {
        var query = input.value;
        
        autocompleteService.getPlacePredictions({ input: query, types: ['geocode', 'establishment'] }, function(predictions, status) {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                // Очищаем предыдущие подсказки
                suggestionsList.innerHTML = '';

                // Создаем элементы списка и добавляем их в блок под инпутом
                predictions.forEach(function(prediction) {
                    var listItem = document.createElement('li');
                    listItem.textContent = prediction.description;
                    suggestionsList.appendChild(listItem);

                    // Добавляем обработчик клика на каждый элемент списка
                    listItem.addEventListener('click', function() {
                        input.value = prediction.description;
                        searchPlace();
                        // Очищаем список подсказок после выбора места
                        // suggestionsList.innerHTML = '';
                    });
                });
            } else {
                while (suggestionsList.firstChild) {
                suggestionsList.removeChild(suggestionsList.firstChild);
                }
                var notFoundItem = document.createElement('li');
                notFoundItem.textContent = "Не найдено";
                suggestionsList.appendChild(notFoundItem);
                console.error('Ошибка при получении предложений автозаполнения:', status);
            }
        });
    });
}


function searchPlace() {
    const input = $('.search-box-input').val();
    const service = new google.maps.places.PlacesService(map);

    // Очистка старых маркеров
    markers.forEach(marker => marker.setMap(null));
    markers = [];

    // Если ввод в формате координат
    const coordinatePattern = /^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/;
    if (coordinatePattern.test(input)) {
        const coords = input.split(',');
        const latLng = new google.maps.LatLng(parseFloat(coords[0]), parseFloat(coords[1]));
        const marker = new google.maps.Marker({
            map,
            position: latLng,
            title: "Custom Location"
        });
        markers.push(marker);
        map.setCenter(latLng);
        map.setZoom(15); // Устанавливаем масштаб для координат
    } else {
        // Поиск по текстовому запросу
        service.textSearch({ query: input }, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                if (results.length == 0) {
                    return;
                }

                // Для каждого найденного места создаем маркер на карте
                const bounds = new google.maps.LatLngBounds();
                results.forEach(place => {
                    if (!place.geometry) {
                        console.log("Returned place contains no geometry");
                        return;
                    }

                    // Создание маркера для места
                    const marker = new google.maps.Marker({
                        map,
                        position: place.geometry.location,
                        title: place.name
                    });
                    //ОТПРАВКА AJAX
                    saveCoordinates(1,1);
                    markers.push(marker);

                    // Расширение границ карты до включения местоположения
                    if (place.geometry.viewport) {
                        bounds.union(place.geometry.viewport);
                    } else {
                        bounds.extend(place.geometry.location);
                    }
                });
                map.fitBounds(bounds);
            } else {
                console.error('Error occurred: ', status);
            }
        });
    }

    $('.route-builder').toggleClass('route-builder-active');
}

$(document).ready(function () {
    // Обработчик события keydown для поля ввода
    $('.search-box-input').keydown(function (event) {
        if (event.key === 'Enter') {
            event.preventDefault(); // предотвратить стандартное поведение формы при нажатии Enter
            searchPlace();
        }
    });

    // Обработчик события click для кнопки поиска
    $('.search-box-btn').click(function (e) {
        e.preventDefault();
        searchPlace();
        
    });
});



function saveCoordinates(latitude, longitude) {
    $.ajax({
        url: '/Coordinates/Save', // URL-адрес контроллера и действия на сервере, куда будет отправлен запрос
        method: 'POST', // Метод HTTP-запроса (POST)
        data: { latitude: latitude, longitude: longitude }, // Данные, которые будут отправлены на сервер (широта и долгота)
        success: function (response) {
            // Обработка успешного ответа от сервера
            if (response.success) {
                // Вывести сообщение пользователю об успешном сохранении координат
                console.log(response.message);
            } else {
                // Вывести сообщение об ошибке, если что-то пошло не так
                alert('Ошибка при сохранении координат');
            }
        },
        error: function (xhr, status, error) {
            // Обработка ошибки
            console.error('Ошибка при сохранении координат:', error);
        }
    });
}
