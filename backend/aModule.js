const fetch = require("node-fetch");
const dotenv = require('dotenv');
dotenv.config();

// hardcode these initial values for wix
var API_URL = process.env.API_URL;
var API_AUTH = process.env.API_AUTH;

//Parselist helper function to take result data from API and return what we need
function Parselist(result) {
     let attendees = result.attendees;
     //console.log(attendees)
     let pages = result.pagination;
     let attendee_list = "";
     let AttList = [];
     let i = 0;
     for (i in attendees) {
          let first_name = result.attendees[i].profile.first_name;
          let last_name = result.attendees[i].profile.last_name;
          let name = result.attendees[i].profile.name;
          let __company = result.attendees[i].profile.company;
          let company = (typeof __company === 'undefined' ) ? 'N/A' : __company;
          let isAttendee = result.attendees[i].ticket_class_name ==='Attendee Admission' ;
          if ( isAttendee ) { 
                AttList.push({ name, company })
          }
     }
     //console.log(AttList)
     const sAttList = AttList.sort((a,b) => ( a.name > b.name) ? 1: -1)
     return sAttList
     
};

export function Poelist(continuation='', acc = []) {

     let url = (continuation === "") ?
          API_URL :
          API_URL + "?continuation=" + continuation;

     //console.log(url) //comment me out later
     return fetch(
          url,
          {
               method: "GET",
               headers: {
                    Authorization: API_AUTH
               }
          }
     )
          .then(response => response.json())
          .then(result => {
               let has_more_items = result.pagination["has_more_items"];
               let nextpagetoken = result.pagination["continuation"]
               let attendeespage = Parselist(result)
               const newacc = acc.concat(attendeespage)
               //console.log(newacc)

               if (has_more_items) {
                    return Poelist(nextpagetoken, newacc)
               }

               else {
                    return newacc
               }
          })
          //.then(console.log.bind(console))
          .catch(console.error.bind(console));
}

// TEST

Poelist()
      .then(myArray => {
      const attcount = myArray.length;
	 var html = '<div class="attcount">' + attcount + ' attendees</div>' + '<ul class="list">' + myArray.map(function (element) {
          let company = (typeof element["company"] === 'undefined') ? 'N/A': element["company"];
          if ( element["name"] !== "Remove Remove") {
                    return '</div><li><div class="list-item"><div class="list-name">' + element["name"] +  
                    '</div><div class="list-company">' + company +  '</div></div></li>'
               }
     }).join('') + '</ul>';
	   $w("#attendeelist").postMessage(html);
	   console.log(html);
	      // Logs: 20
	})
	.catch(error => {
		console.log(error);
	})