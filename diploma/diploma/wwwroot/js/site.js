
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







