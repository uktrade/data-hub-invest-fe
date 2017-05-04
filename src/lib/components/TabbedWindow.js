const {debounce, extend} = require('lodash')
const EventEmitter = require('eventemitter3')
// TODO move globally or into the config ? has to be the same as the media query for tablets
const enableIfScreenSmallerThan = 641
const DOM_EL_WINDOW = '.tabbedwindow'
const DOM_EL_TAB = '.tabbedwindow__tab'
const DOM_EL_TAB_ICON = '.tabbedwindow__tab__icon'
const DOM_EL_NAV = '.tabbedwindow__nav'
const DOM_EL_PANE = '.tabbedwindow__pane'

const CSS_CLASS_TAB = `${DOM_EL_TAB}`.replace('.', '')
const CSS_CLASS_TAB_ACTIVE = `${CSS_CLASS_TAB}--active`

/**
 * TabbedWindow constructor
 * @extends EventEmitter
 *
 * toggleaccordion event
 * @event TabbedWindow#toggleaccordion
 * @type {object}
 * @property {string} accordionState - (open|closed)
 *
 * accordionenabled event fired when the mobile breakpoint is triggered
 * @event TabbedWindow#accordionenabled
 * @type {boolean}

 * accordiondisabled event fired when the desktop breakpoint is triggered
 * @event TabbedWindow#accordiondisabled
 * @type {boolean}
 *

 * accordionopened event
 * @event TabbedWindow#accordionopened
 * @type {object}
 *
 * accordionclosed event
 * @event TabbedWindow#accordionclosed
 * @type {object}
 */
function TabbedWindow () {
  // initialise EvemtEmitter
  EventEmitter.call(this)
  this.accordionEnabled = false
  this.accordionState = 'closed'
  this.domEl = document.querySelector(DOM_EL_WINDOW)
  this.domElTabs = [].slice.call(document.querySelectorAll(DOM_EL_TAB))
  this.domElNav = document.querySelector(DOM_EL_NAV)
  this.domElPane = document.querySelector(DOM_EL_PANE)
}

TabbedWindow.prototype = extend(EventEmitter.prototype, {
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
  /**
   * called (via a debounce) on window resize. Emits an event when breakpoint is changed (tabletbreakpoint|desktopbreakpoint)
   * @return {void}
   */
  updateDisplay: function () {
    let screenIsSmall = document.documentElement.clientWidth <= enableIfScreenSmallerThan
    if (screenIsSmall && this.accordionEnabled === false) {
      this.emit('tabletbreakpoint')
    } else if (!screenIsSmall && this.accordionEnabled === true) {
      this.emit('desktopbreakpoint')
    }
  },
  /**
   * click event callback for tab navigation items
   * @param  {DOMEvent} e dom event
   * @return {void}
   */
  onTabClick: function (e) {
    let el = e.target
    let payload = {target: el}
    if (!el.classList.contains(CSS_CLASS_TAB) || !this.accordionEnabled) {
      return
    }
    if (this.isItemCollapsed(el)) {
      this.accordionState = 'open'
      this.emit('toggleaccordion', payload)
    } else {
      this.accordionState = 'closed'
      this.emit('toggleaccordion', payload)
    }
  },
  /**
   * callback for toggleaccordion event
   * @param  {object} payload contains event data
   * @return {void}
   */
  onAccordionStateToggled: function (payload) {
    if (this.accordionState === 'open') {
      this.openAccordion(payload)
    } else if (this.accordionState === 'closed') {
      this.closeAccordion(payload)
    }
  },
  openAccordion: function (payload) {
    this.setChevronUp(payload.target)
    this.show(this.getNonActiveItems())
    this.emit('accordionopened')
  },
  closeAccordion: function (payload) {
    this.setChevronDown(payload.target)
    this.hide(this.getNonActiveItems())
    this.emit('accordionclosed')
  },
  init: function () {
    // event listeners
    // dom events
    window.addEventListener('resize', debounce(this.updateDisplay.bind(this), 100))
    window.addEventListener('load', this.updateDisplay.bind(this))
    this.domEl.addEventListener('click', this.onTabClick.bind(this))
    // custom component events
    this.on('toggleaccordion', this.onAccordionStateToggled.bind(this))
    this.on('tabletbreakpoint', function (e) {
      this.accordionEnabled = true
      this.hide(this.getNonActiveItems())
      this.disableActiveLink()
    })
    this.on('desktopbreakpoint', function (e) {
      this.accordionEnabled = false
      this.accordionState = 'closed'
      this.setChevronDown(this.getActiveItem())
      this.show(this.domElTabs)
    })
  }
})

module.exports = TabbedWindow
