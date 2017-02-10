
const searchfield =document.querySelector("#inv-search");
const resultsdiv = document.querySelector("#inv-results");

const trade = require('@uktrade/trade_elements').elementstuff

const companyTemplate = "<a href='#'>[[name]]</a>" +
  "<br>[[address]]</div>" +
  "<div class='hidden subresults'>" +
  "<table class='table--key-value  table--readonly'>"+
  "<tr>" +
  "<td>Company Type</td>" +
  "<td>[[company_type]]</td>" +
  "</tr>"+
  "<tr>" +
  "<td>Investment in the UK</td>" +
  "<td>[[investment_projects]]</td>" +
  "</tr>"+
  "<tr>" +
  "<td>Account tier</td>" +
  "<td>[[account_tier]]</td>" +
  "</tr>"+
  "<tr>" +
  "<td>Account Manager in the UK</td>" +
  "<td>[[account_manager]]</td>" +
  "</tr>"+
  "</table>"+
  "<div class='save-bar'>" +
  "<button class='button button--save' type='submit'>Choose company</button>" +
  "<a class='button-link button--cancel js-button-cancel' href='#' id='[[id]]'>Close</a>" +
  "</div>" +
  "</div>";



function ifdef(thing, replacer) {
  var replacer = replacer || "";
  return (!!thing) ? thing : replacer;
}

function updateSearchField(res) {

  trade.removeClass(resultsdiv, "hidden")
  resultsdiv.innerHTML = ""
  trade.removeClass(document.querySelector("#new_co_nagger"), "hidden")
  const companies = JSON.parse(res.response)
  Object.keys(companies).forEach(function(key){
    let co = companies[key]
    let d = document.createElement("div")
    d.id = "inv-res-" + key
    d.className = "inv-result"
    let divtext = companyTemplate.replace("[[name]]", co._source.name)
    divtext = divtext.replace("[[address]]", ifdef(co._source.registered_address_1) + ", " + ifdef(co._source.registered_address_town) + " " + co.country)
    divtext = divtext.replace("[[company_type]]", "Foreign company");
    divtext = divtext.replace("[[investment_projects]]", co.details.length);
    divtext = divtext.replace("[[account_tier]]", co.summary.investment_tier);
    divtext = divtext.replace("[[account_manager]]", co.summary.investment_account_manager.name);
    divtext = divtext.replace("[[id]]", "close-" + key);

    d.innerHTML = divtext;
    resultsdiv.appendChild(d);
    setTimeout(function() {
        let resblock = document.querySelector("#inv-res-" + key + " > .subresults");
        document.querySelector("#inv-res-" + key).addEventListener("click", function() {
            trade.show(resblock)
        }, true)
        document.querySelector("#close-" + key).addEventListener("click", function() {
          trade.hide(resblock)
        }, true)
    },10)

  })
}

function searchCos(term) {
  const companyRequest = new XMLHttpRequest();
  companyRequest.onreadystatechange = function() {
    if (companyRequest.readyState === 4) {
      updateSearchField(companyRequest);
    }
  }

  companyRequest.open("GET", "/api/investment/search/" + term);
  companyRequest.send();
}

searchfield.addEventListener("keyup", function() {
  searchCos(searchfield.value)
}, true);
