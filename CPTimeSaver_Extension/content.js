// console.log('welcome to CPTimeSaver');

// var jq = document.createElement('script');
// jq.onload = function(){};
// jq.src = "https://code.jquery.com/jquery-3.6.0.min.js";
// document.querySelector('head').appendChild(jq);

// alert('hello there');

// /* Import JQuery 3.6.0 if not present */
// var script = document.createElement('script');
// script.src = 'https://code.jquery.com/jquery-3.6.0.min.js';
// script.type = 'text/javascript';
// document.getElementsByTagName('head')[0].appendChild(script);
// console.log('loading jQuery Version 3.6.0');


/* global helper functions */
function sleep (ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function waitForAddedNode(params) {
    new MutationObserver(function(mutations) {
        var el = document.getElementById(params.id);
        if (el) {
            this.disconnect();
            params.done(el);
        }
    }).observe(params.parent || document, {
        subtree: !!params.recursive || !params.parent,
        childList: true,
    });
}

function simulateKeyPress(character) {
    var keyCode;
    if (character.length > 1) {
        if (character=='tab') {
            keyCode = 9;
        } else if (character == 'enter') {
            keyCode = 13;
        }

    } else {
        keyCode = character.charCodeAt(0);
    }
    jQuery.event.trigger({ type : 'keypress', which : keyCode });
}


/* vpn check + fast navigate to timesheet */
$(document).ready( function() {
    if (window.location.pathname=='/cploginform.htm') {
        console.log('loginform');
        go2MasterPage();
    } else if (window.location.pathname=='/masterPage.htm') {
        console.log('masterpage');
        go2Timesheet();
    }
});
function go2MasterPage() {
    var myScript = document.createElement("script");
    myScript.innerHTML = 
      `
      function attemptInputUserInfo() {
          setTimeout(function() {
            console.log('attempting to open enter username...');
            if (document.getElementById("USER") != null ) {
                document.getElementById("USER").value = "pwolfe8";
                document.getElementById("USER").onchange();
            } else {
                attemptInputUserInfo();
            }
          }, 500);
      }
      attemptInputUserInfo();
      `;
    document.body.appendChild(myScript);
}
function go2Timesheet() {
    var myScript = document.createElement("script");
    myScript.innerHTML = 
      `
      function attemptBuild() {
        setTimeout(function() {
            console.log('attempting to open fav menu...');
            if (typeof ProductNav.myMnu != 'undefined') {
                ProductNav.buildMyMenu(MyMenuMgr.myMenuArray);
                ProductNav.myMnu.style.visibility='visible';
                attemptClick();
            } else {
                attemptBuild();
            }
        }, 500);
      }
      function attemptClick() {
        setTimeout(function() {
            console.log('attempting to click timesheet in fav menu...');
            if (document.getElementById('myMnuLbl0') != null) {
                document.getElementById('myMnuLbl0').click();
            } else {
                attemptClick();
            }
          }, 500);
      }
      attemptBuild();
      `;
    document.body.appendChild(myScript);
}


/* Calculate Surplus Hours Worked */
var daysInMonth = null;
var currentTotalHours = null;
var lastTotalHours = null;
var originalPrintText = null;
var lastTotalHours = null;
var calculatedSurplusHours = 'XX';

function isWeekday(dayNumber) {
    // get year and month from the end date on page
    var spl = $('#END_DT').val().split('/');
    var dayIdx = new Date(`${spl[0]}/${dayNumber}/${spl[2]}`).getDay();
    return (dayIdx != 0) && (dayIdx != 6);
}

function calcSurplus() {
    // only run if we're on the timesheet page 
    if (!$('#SCHEDULE_DESC_AND_P_TEXT').length) { // (check if can't find monhtly hours box)
        console.log('can\'t find monthly hours. not doing calculation...');
        return;
    }
    // check if total hours have changed to see if new calculation is needed
    if (!$('#rft2').find('span:first').text().length) {
        console.log('current total hours not present. not doing calculation...')
        return;
    }
    currentTotalHours = parseFloat($('#rft2').find('span:first').text());

    // update last total hours
    if (lastTotalHours == null){
        lastTotalHours == currentTotalHours;
    }
    else if (currentTotalHours == lastTotalHours) {
        // do no calcuation if no change in total hours
        return;
    } else {
        lastTotalHours = currentTotalHours;
    }

    // create span to print surplus hours on if doesn't exist yet
    if (!$('#surplusHours').length) {
        var printSpanInstance = $(`<span id="surplusHours" class="sbtskLnk" style="color: green; padding-left: 7px; padding-right: 7px; font-size: 8pt; letter-spacing: 0.254px;">Surplus Hours: XX</span>`);
        $('.subtaskTbl:first').append(printSpanInstance);
    }

    // get number of days in the month
    daysInMonth = parseInt($('#END_DT').val().split('/')[1]);
    // console.log(`days in month: ${daysInMonth}`);

    // Count number of workdays that should have hours filled 
    var firstDayDivOffset = 26;
    var foundLastEnteredDay = false;
    var numWorkdaysSoFar = 0;
    for (dayNum=daysInMonth; dayNum > 0; dayNum--) { // count from end of month to beginning
        // retrieve num hours on this day
        var hasHours = $('#tot2').children('div').eq(firstDayDivOffset+dayNum).text().length > 0;
        var isWorkday = isWeekday(dayNum);
        var hours = parseFloat($('#tot2').children('div').eq(firstDayDivOffset+dayNum).text());
        // console.log(`day: ${dayNum} hours: ${hours} hasHours: ${hasHours} isWorkday: ${isWorkday}`);

        // check if found last day yet first
        if (!foundLastEnteredDay) {     
            // check if day has hours
            if (hasHours) {         
                // check if it's a workday
                if (isWorkday) {        
                    // flip flag for found first day and increment workday counter
                    foundLastEnteredDay = true;
                    numWorkdaysSoFar++;
                }
            }
        } else if (isWorkday) {         // count workdays until last entered day
            numWorkdaysSoFar++;         // increment workday counter
        }
    }

    // final calc & set text/color
    // var expectedMonthTotal = parseInt($('#SCHEDULE_DESC_AND_P_TEXT')[0].value.split(' ')[1]);
    calculatedSurplusHours =  currentTotalHours - numWorkdaysSoFar * 8;
    var surplusHoursColor = calculatedSurplusHours >= 0 ? 'green' : 'red';
    console.log('work days so far: ' + numWorkdaysSoFar + ', current total: ' + currentTotalHours + ', surplus: ' + calculatedSurplusHours );
    $('#surplusHours').text(`Surplus Hours ${calculatedSurplusHours}`);
    $('#surplusHours').css('color', surplusHoursColor);
}

// async wait for timesheet page and current hours to be present and ready for first page load calc of surplus hours
async function waitForCurrentTotalHoursBeforeCalcSurplus() {
    while (!$('#rft2').find('span:first').text().length) {
        // console.log('waiting 200 ms');
        await sleep(200);
    }
    calcSurplus();
}
waitForAddedNode({
    id: 'vg_vg_1__TMMTIMESHEET___TMMTIMESHEET',
    parent: document.querySelector('.visLayer'),
    recursive: false,
    done: function(el) {
        waitForCurrentTotalHoursBeforeCalcSurplus();   
    }
});
// also update surplus hours on change in input values
$(document).on('change', 'input', calcSurplus);


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
  