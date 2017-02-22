let toggleEnabled = null
// TODO move globally or into the config ? has to be the same as the media query for tablets
let enableIfScreenSmallerThan = 641

function allItems() {
    return document.querySelectorAll('.left-nav nav div')
}

function nonActiveItems() {
    return document.querySelectorAll(".left-nav nav div:not(.active)")
}

function disableActiveLink() {
    return document.querySelectorAll(".left-nav nav div.active a").setAttribute('onclick', 'return false')
}

function isItemCollapsed(item) {
    let chevron = item.querySelector('.collapse-filter')
    return chevron.classList.contains('fa-chevron-down') ? true : false
}

function setChevronUp(item) {
    let chevron = item.querySelector('.collapse-filter')
    chevron.classList.remove('fa-chevron-down')
    chevron.className += ' fa-chevron-up '
}

function setChevronDown(item) {
    let chevron = item.querySelector('.collapse-filter')
    chevron.classList.remove('fa-chevron-up')
    chevron.className += ' fa-chevron-down '
}

function show(items) {
    [].forEach.call(items, function (a) {
        a.style.display = null

    });
}

function hide(items) {
    [].forEach.call(items, function (a) {
        a.style.display = 'none'
    });
}

// expand/collapse logic
[].forEach.call(allItems(), function (item) {
    item.addEventListener('click', function () {
        if (!toggleEnabled) {
            return
        }
        if (isItemCollapsed(item)) {
            setChevronUp(item)
            show(nonActiveItems())
        } else {
            setChevronDown(item)
            hide(nonActiveItems())
        }
    });
});

// show all items, or one items depending on the sceen size
function init() {
    let screenIsSmall = document.documentElement.clientWidth <= enableIfScreenSmallerThan
    if (screenIsSmall) {
        hide(nonActiveItems())
        toggleEnabled = true
        disableActiveLink()
    } else {
        show(allItems())
        toggleEnabled = false
    }
}

window.addEventListener("resize", init)
window.addEventListener("load", init)

module.exports = {};