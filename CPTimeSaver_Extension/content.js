/* Import JQuery 3.6.0 if not present */
if (typeof jQuery != 'undefined') {  
    // jQuery is loaded => print the version
    console.log('jQuery Version loaded is: ' + jQuery.fn.jquery);
} else {
    var script = document.createElement('script');
    script.src = 'https://code.jquery.com/jquery-3.6.0.min.js';
    script.type = 'text/javascript';
    document.getElementsByTagName('head')[0].appendChild(script);
    console.log('loading jQuery Version 3.6.0');
}

/* @TODO vpn check + fast navigate to timesheet */


/* Calculate Surplus Hours Worked */
 
function isWorkday(innerDoc, date_num) {
    if (innerDoc == null)
        return null;
    
    // hrsHeaderTextX is format, where X is (date_num - 1)
    var id_str = 'hrsHeaderText' + (date_num - 1);
    var hrsHeaderBox = innerDoc.getElementById(id_str);
    if (hrsHeaderBox == null)
        return null;

    var txt = hrsHeaderBox.textContent
    var dayStr = txt.slice(0, 3);
    
    var isTrue = true;
    if (dayStr == 'Sat' || dayStr == 'Sun')
        isTrue = false;
    
    return isTrue;

}

function dayHoursEmpty(innerDoc, date_num) {
    if (innerDoc == null)
        return null;

    //DT2_x is format, where X is (date_num - 1)
    var id_str = 'DT2_' + (date_num - 1);
    var totalDayHoursBox = innerDoc.getElementById(id_str);
    if (totalDayHoursBox == null)
        return null;

    if (totalDayHoursBox.textContent == '')
        return true;
    else 
        return false;

}

var daysInMonth = null;
var currentTotalHours = null;
var lastTotalHours = null;

var originalPrintText = null;
var lastTotalHours = null;
var calculatedSurplusHours = 'calculating...';

// var jqFindSurplusPrint = 'div:contains("Timesheet Lines"):last';
var jqFindSurplusPrint = '.subtaskTbl:first';

setInterval(function() {
    
    // grab total hours worked so far
    // and do no calculation if total hours is same as last updated ones
    // monthTotal = parseInt($('#SCHEDULE_DESC_AND_P_TEXT')[0].value.split(' ')[1]);
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
    
    // main calculation 
    var foundLastEnteredDay = false;
    var numWorkdaysSoFar = 0;
    // count backwards from last day
    for (i=daysInMonth; i>0; i--) {
        // check if found last day
        if (!foundLastEnteredDay) {
            // check if that days total hours is empty
            if (!dayHoursEmpty(innerDoc, i)) {
                foundLastEnteredDay = true;
                numWorkdaysSoFar++;
            }
        } 
        // count workdays until last entered day
        else {
            if ( isWorkday(innerDoc, i) ) {
                numWorkdaysSoFar++;
            }
        }
    }

    // final calc & set text
    calculatedSurplusHours =  currentTotalHours - numWorkdaysSoFar * 8;
    console.log('work days so far: ' + numWorkdaysSoFar + ', current total: ' + currentTotalHours + ', surplus: ' + calculatedSurplusHours );
    $('#surplusHours').text(`Surplus Hours ${calculatedSurplusHours}`);
        
}, 2000); // trigger every 2 second(s)



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
  
