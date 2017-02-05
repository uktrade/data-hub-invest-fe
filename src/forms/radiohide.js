const { addClass, removeClass } = require('@uktrade/trade_elements').elementstuff

function radioHide (name, hideFor, targetElementSelector, defaultHidden) {
  const targetElement = document.querySelector(targetElementSelector)

  function updateVisible () {
    const selectedElement = document.querySelector(`input[name="${name}"]:checked`)

    if (!selectedElement && defaultHidden || selectedElement.value === hideFor) {
      addClass(targetElement, 'hidden')
    } else {
      removeClass(targetElement, 'hidden')
    }
  }

  document.querySelector('form').addEventListener('change', function (event) {
    if (event.target.name && event.target.name === name) {
      updateVisible()
    }
  })

  updateVisible()
}

module.exports = radioHide
