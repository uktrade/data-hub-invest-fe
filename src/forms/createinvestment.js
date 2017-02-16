const trade = require('@uktrade/trade_elements').elementstuff

const areClientRelationship = document.querySelectorAll(".client-rev-reveal > label > input")[0];
const notClientRelationship = document.querySelectorAll(".client-rev-reveal > label > input")[1];
const differentclientrelationship = document.querySelector("#crm-wrapper")


notClientRelationship.addEventListener("click", () => {
    trade.removeClass(differentclientrelationship, "hidden")},
  true
  )

areClientRelationship.addEventListener("click", () => {
    trade.addClass(differentclientrelationship, "hidden")},
  true
)
