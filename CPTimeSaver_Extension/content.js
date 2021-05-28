// console.log('welcome to CPTimeSaver');

// var jq = document.createElement('script');
// jq.onload = function(){};
// jq.src = "https://code.jquery.com/jquery-3.6.0.min.js";
// document.querySelector('head').appendChild(jq);

// alert('hello there');


// /* Import JQuery 3.6.0 if not present */
// if (typeof jQuery != 'undefined') {  
//     // jQuery is loaded => print the version
//     console.log('jQuery Version loaded is: ' + jQuery.fn.jquery);
// } else {
//     var script = document.createElement('script');
//     script.src = 'https://code.jquery.com/jquery-3.6.0.min.js';
//     script.type = 'text/javascript';
//     document.getElementsByTagName('head')[0].appendChild(script);
//     console.log('loading jQuery Version 3.6.0');
// }

/* @TODO vpn check + fast navigate to timesheet */


function isWorkdayString(s) {
    return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].includes(s);
}

/* Calculate Surplus Hours Worked */
var daysInMonth = null;
var currentTotalHours = null;
var lastTotalHours = null;

var originalPrintText = null;
var lastTotalHours = null;
var calculatedSurplusHours = 'calculating...';

function calcSurplus() {
    // only run if we're on the timesheet page 
    if (!$('#SCHEDULE_DESC_AND_P_TEXT').length) { // (check if can't find monhtly hours box)
        return;
    } else {
        console.log('found monthly hours. doing surplus hour calculation...');
    }

    // check if total hours have changed to see if new calculation is needed
    currentTotalHours = parseFloat($('#rft2').find('span:first').text());
    if (lastTotalHours == null){
        lastTotalHours == currentTotalHours;
    }
    else if (currentTotalHours == lastTotalHours){
        return;
    } else {
        lastTotalHours = currentTotalHours;
    }

    // create span to print surplus hours on if doesn't exist yet
    if (!$('#surplusHours').length) {
        var printSpanInstance = $('<span id="surplusHours" style="padding-left: 7px; padding-right: 7px; font-size: 8pt; letter-spacing: 0.254px;">Surplus Hours: XX</span>');
        $('.subtaskTbl:first').append(printSpanInstance);
    }

    // get number of days in the month
    daysInMonth = parseInt($('#END_DT').val().split('/')[1]);
    console.log(`days in month: ${daysInMonth}`);

    /* Count number of workdays that should have hours filled */
    // get div index to first day (format of id: hdDiv26_1 for date. hdDiv26_0 for day)
    // var firstDayDivIdx = parseInt($('div:contains("/1/")').filter('.hdDiv').attr('id').split('hdDiv')[1].split('_')[0]);
    // console.log(`got first day div idx: ${firstDayDivIdx}`);
    var firstDayDivIdx = 26;
    var day = NaN;
    var date = NaN;
    var hours = NaN;
    var foundLastEnteredDay = false;
    var numWorkdaysSoFar = 0;
    // count from end of month to beginning
    for (i=firstDayDivIdx + daysInMonth; i>firstDayDivIdx; i--) {
        
        // retrieve day/date/hours
        day = $(`#hdDiv${i-1}_0`).text();
        date = $(`#hdDiv${i-1}_1`).text();
        hours = parseFloat($('#tot2').children('div').eq(i).text());
        console.log(`${day} ${date}: ${hours} hrs`);

        // check if found last day
        if (!foundLastEnteredDay) {
            // check if day has hours
            if (hours != NaN) {
                // check if it's a workday
                if (isWorkdayString(day)) { 
                    console.log(`found first workday!`);
                    // flip flag and start counting workdays
                    foundLastEnteredDay = true;
                    numWorkdaysSoFar++;
                }
            }
        }
        // count workdays until last entered day
        else if (isWorkdayString(day)) { 
            console.log(`this is a workday`);
            // increment workday counter
            numWorkdaysSoFar++;
        }
    }

    // final calc & set text
    // monthTotal = parseInt($('#SCHEDULE_DESC_AND_P_TEXT')[0].value.split(' ')[1]);
    calculatedSurplusHours =  currentTotalHours - numWorkdaysSoFar * 8;
    console.log('work days so far: ' + numWorkdaysSoFar + ', current total: ' + currentTotalHours + ', surplus: ' + calculatedSurplusHours );
    $('#surplusHours').text(`Surplus Hours ${calculatedSurplusHours}`);
    
}
function sleep (ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
async function timeoutHandler() {
    await sleep(1);
    $(document).ready(calcSurplus);
}
setInterval(timeoutHandler, 5000);


/* Enable Custom Charge Number Names */

// var iframe = document.getElementById('unitFrame');
// if (iframe != null) {
//     iframe.addEventListener("load", function() {

//         var innerDoc = iframe.contentDocument || iframe.contentWindow.document;
//         if (innerDoc == null)
//             return;
        
//         var projectNameColumn = innerDoc.getElementById('udtColumn0');
//         if (projectNameColumn == null)
//             return;      

//         numchildren = projectNameColumn.children.length;
//         for (i=0; i<numchildren; i++) {
//             var el = innerDoc.getElementById('udt' + i + '_0');
//             if (el.textContent.length > 0) {
                
//                 console.log(el.textContent);
//                 var btn = document.createElement("BUTTON");
//                 btn.setAttribute("class","button_styling");
//                 btn.innerHTML = "&#x22EE "; 
//                 el.appendChild(btn);
//                 // el.insertBefore(btn, el.firstChild);
                
//                 // btn.setAttribute("onclick", alert("clicked"));
//             }
                

//         }

//     });
// }
  
