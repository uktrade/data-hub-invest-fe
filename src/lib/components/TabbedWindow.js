// TODO move globally or into the config ? has to be the same as the media query for tablets
const enableIfScreenSmallerThan = 641
const DOM_EL_WINDOW = '.tabbedwindow'
const DOM_EL_TAB = '.tabbedwindow__tab'
const DOM_EL_TAB_ICON = '.tabbedwindow__tab__icon'
const DOM_EL_NAV = '.tabbedwindow__nav'
const DOM_EL_PANE = '.tabbedwindow__pane'

const CSS_CLASS_TAB = `${DOM_EL_TAB}`.replace('.', '')
const CSS_CLASS_TAB_ACTIVE = `${CSS_CLASS_TAB}--active`

let toggleEnabled = null

function TabbedWindow () {
  this.toggleEnabled = null
  this.domEl = document.querySelector(DOM_EL_WINDOW)
  this.domElTabs = [].slice.call(document.querySelectorAll(DOM_EL_TAB))
  this.domElNav = document.querySelector(DOM_EL_NAV)
  this.domElPane = document.querySelector(DOM_EL_PANE)
}

TabbedWindow.prototype = {
  onActiveItems: function () {
    return document.querySelectorAll(CSS_CLASS_TAB_ACTIVE)
  },
  getNonActiveItems: function () {
    return this.domElTabs.filter(tab => tab.classList.contains(CSS_CLASS_TAB_ACTIVE) === false)
  },
  disableActiveLink: function () {
    return document.querySelector('.' + CSS_CLASS_TAB_ACTIVE).setAttribute('onclick', 'return false')
  },

  isItemCollapsed: function (item) {
    let chevron = item.querySelector(DOM_EL_TAB_ICON)
    return chevron.classList.contains('fa-chevron-down')
  },

  getActiveItem: function () {
    return document.querySelector(`.${CSS_CLASS_TAB_ACTIVE}`)
  },

  setChevronUp: function (item) {
    let chevron = item.querySelector(DOM_EL_TAB_ICON)
    chevron.classList.remove('fa-chevron-down')
    chevron.className += ' fa-chevron-up '
  },

  setChevronDown: function (item) {
    let chevron = item.querySelector(DOM_EL_TAB_ICON)
    chevron.classList.remove('fa-chevron-up')
    chevron.className += ' fa-chevron-down '
  },

  show: function (items) {
    [].forEach.call(items, function (a) {
      a.style.display = null
    })
  },

  hide: function (items) {
    [].forEach.call(items, function (a) {
      a.style.display = 'none'
    })
  },
  updateDisplay: function () {
    // @TODO stop calling updateDisplay resize
    // running dom queries on window resize is bad for performance
    // switch to event driven UI (JS Events)
    let screenIsSmall = document.documentElement.clientWidth <= enableIfScreenSmallerThan
    if (screenIsSmall) {
      this.hide(this.getNonActiveItems())
      this.toggleEnabled = true
      this.disableActiveLink()
    } else {
      this.setChevronDown(this.getActiveItem())
      this.show(this.domElTabs)
      this.toggleEnabled = false
    }
  },
  onTabClick: function (e) {
    let el = e.target
    if (!el.classList.contains(CSS_CLASS_TAB)) {
      return
    }
    if (!this.toggleEnabled) {
      return
    }
    if (this.isItemCollapsed(el)) {
      this.setChevronUp(el)
      this.show(this.getNonActiveItems())
    } else {
      this.setChevronDown(el)
      this.hide(this.getNonActiveItems())
    }
  },
  init: function () {
    // @TODO setinterval on resize callback being fired for performance reason
    window.addEventListener('resize', this.updateDisplay.bind(this))
    window.addEventListener('load', this.updateDisplay.bind(this))
    // expand/collapse logic

    this.domEl.addEventListener('click', this.onTabClick.bind(this))
    console.log('TabWindow initialied!')
    console.log(this)
  }
}

module.exports = TabbedWindow
