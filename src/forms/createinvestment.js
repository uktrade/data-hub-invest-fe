const axios = require('axios');


const trade = require('@uktrade/trade_elements').elementstuff

const areClientRelationship = document.querySelectorAll(".client-rev-reveal > label > input")[0];
const notClientRelationship = document.querySelectorAll(".client-rev-reveal > label > input")[1];
const differentclientrelationship = document.querySelector("#crm-wrapper")
const sectorDropdown = document.querySelector("#sector")
const subSectorDropdown = document.querySelector("#subsector")
const subSectorDropdownWrapper = document.querySelector("#subsector-wrapper")


notClientRelationship.addEventListener("click", () => {
    trade.removeClass(differentclientrelationship, "hidden")
  },
  true
)

areClientRelationship.addEventListener("click", () => {
    trade.addClass(differentclientrelationship, "hidden")
  },
  true
)

function hasSubs(id) {
  axios.get(`/api/investment/subsectors/${id}`)
    .then((result) => {
      if (result.data.length > 0) {
        subSectorDropdown.innerHTML = '<option value="-">Pick a value</option>'
        result.data.forEach((el) => {
          subSectorDropdown.innerHTML += `<option value="${el.id}">${el.name}</option>`
        })
        trade.removeClass(subSectorDropdownWrapper, "hidden")
      } else {
        trade.addClass(subSectorDropdownWrapper, "hidden")
      }
    })
}

sectorDropdown.addEventListener("change", (ev) => hasSubs(ev.target.value))
