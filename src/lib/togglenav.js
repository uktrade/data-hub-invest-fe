// chevron handler events

var menu = document.querySelector('.left-nav');
var allItems = menu.querySelectorAll("nav div");

function attachEvents() {
    [].forEach.call(allItems, function (e) {
        e.addEventListener('click', function () {
            if (document.documentElement.clientWidth > 641) {
                return;
            }
            var chevron = e.querySelector('.collapse-filter');
            var menu = document.querySelector('.left-nav');
            var nonActiveItems = menu.querySelectorAll("nav div:not(.active)");

            if (chevron.classList.contains('fa-chevron-down')) {
                // expand
                chevron.classList.remove('fa-chevron-down');
                chevron.className += ' fa-chevron-up ';
                [].forEach.call(nonActiveItems, function (a) {
                    a.style.display = null;
                });

            } else {
                //collapse
                chevron.classList.remove('fa-chevron-up');
                chevron.className += ' fa-chevron-down ';
                [].forEach.call(nonActiveItems, function (a) {
                    a.style.display = 'none';
                });
            }
        });
    });
}

attachEvents();

// on resize, hide items except the active one
function togglerHandler() {
    var menu = document.querySelector('.left-nav');
    var nonActiveItems = menu.querySelectorAll("nav div:not(.active)");

    if (document.documentElement.clientWidth <= 641) {
        [].forEach.call(nonActiveItems, function (a) {
            a.style.display = 'none';
        });
    } else {
        [].forEach.call(allItems, function (a) {
            a.style.display = null;
        });
    }
}

window.addEventListener("resize", togglerHandler);
window.addEventListener("load", togglerHandler);

module.exports = {}
