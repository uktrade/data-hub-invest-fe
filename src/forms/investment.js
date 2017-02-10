
var searchfield =document.querySelector("#inv-search");
var resultsdiv = document.querySelector("#inv-results");


var companyTemplate = "<a href='#'>[[name]]</a>" +
  "<br>[[address]]</div>" +
  "<div class='inv-hidden'>" +
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
  "<a class='button-link button--cancel js-button-cancel' href='#'>Close</a>" +
  "</div>" +
  "</div>";


function toggle_sub(ev) {
  var hid = this.querySelector('.inv-hidden');

  if (!hid.data || hid.data == "hidden") {
    hid.style.display = "block";
    hid.data ="showing";
  } else {
    hid.style.display = "none";
    hid.data ="hidden";
  }
}

function ifdef(thing, replacer) {
  var replacer = replacer || "";
  return (!!thing) ? thing : replacer;
}

function updateSearchField(res) {
  resultsdiv.style.display = "block";
  resultsdiv.innerHTML = "";
  document.querySelector("#new_co_nagger").style.display = "block";
  var companies = JSON.parse(res.response);
  Object.keys(companies).forEach(function(key){
    var co = companies[key];
    var d = document.createElement("div");
    d.id = "inv-res-" + key;
    d.className = "inv-result";
    var divtext = companyTemplate.replace("[[name]]", co._source.name)
    divtext = divtext.replace("[[address]]", ifdef(co._source.registered_address_1) + ", " + ifdef(co._source.registered_address_town) + " " + co.country)
    divtext = divtext.replace("[[company_type]]", "Foreign company");
    divtext = divtext.replace("[[investment_projects]]", co.details.length);
    divtext = divtext.replace("[[account_tier]]", co.summary.investment_tier);
    divtext = divtext.replace("[[account_manager]]", co.summary.investment_account_manager.name);
    d.innerHTML = divtext;
    d.addEventListener("click", toggle_sub, false);
    resultsdiv.appendChild(d);
  })
}

function searchCos(term) {
  var companyRequest = new XMLHttpRequest();
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
