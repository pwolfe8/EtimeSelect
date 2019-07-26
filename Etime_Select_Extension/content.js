/* Select the Unselectable Charge Numbers */
function selectElement(e) {
    var x = e.clientX, y = e.clientY, elementMouseIsOver = document.elementsFromPoint(x, y);

    // get the raw text inside selected element
    var raw_text_element = elementMouseIsOver[0]
    if (raw_text_element == null)
        return;
    var raw_text = raw_text_element.textContent;
    
    // select raw text if not empty and of proper class name
    if (raw_text_element.length > 0 && elementMouseIsOver[0].className === "u") {
        window.getSelection().selectAllChildren(elementMouseIsOver[0]);
    }
}
$(window).click(selectElement);


/* Calculate Surplus Hours Worked */

// $("body").on('DOMSubtreeModified', "unitFrameDiv", function() {
//     console.log('changed');
// });

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
    
    // console.log("day: " + dayStr + '('+ date_num + '), workday: ' + isTrue);
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

    // console.log('total day hours: ' + totalDayHoursBox.textContent);
    if (totalDayHoursBox.textContent == '')
        return true;
    else 
        return false;

}


var monthPeriodEndText = null;
var daysInMonth = null;
var currentTotalHours = null;
var lastTotalHours = null;




setInterval(function() {
// chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {
    //   if (request.greeting == "hello") {
        
    // grab inner doc 
        var iframe = document.getElementById('unitFrame');
        if (iframe == null)
            return;
        var innerDoc = iframe.contentDocument || iframe.contentWindow.document;
        if (innerDoc == null)
            return;
        
        
        // grab total hours worked so far
        var currentTotalHoursBox = innerDoc.getElementById('grandTotal2');
        if (currentTotalHoursBox == null)
            return;
        currentTotalHours = currentTotalHoursBox.textContent;
        // TODO: check for updates on currentTotalHours and recalculate if so



        // get box for month period total for num days in month and also to print to it
        var monthPeriodEndBox = innerDoc.getElementById('endingDateSpan');
        if (monthPeriodEndBox == null)
            return;
        if (monthPeriodEndText == null) { // check if init box val has been grabbed yet (only grab once)
            monthPeriodEndText = monthPeriodEndBox.textContent;
            daysInMonth = monthPeriodEndBox.textContent.split(' ')[1].split(',')[0]; // get number of days in month
        }

        
        // main calculation 
        var foundLastEnteredDay = false;
        var numWorkdaysSoFar = 0;
        for (i=daysInMonth; i>0; i--) {
            // check if found last day
            if (!foundLastEnteredDay){
                // check if that days total hours is empty
                if (!dayHoursEmpty(innerDoc, i)){
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

        // final calc
        var calculatedSurplusHours =  currentTotalHours - numWorkdaysSoFar * 8;
        console.log('work days so far: ' + numWorkdaysSoFar + ', current total: ' + currentTotalHours + ', surplus: ' + calculatedSurplusHours );
        
        monthPeriodEndBox.textContent = monthPeriodEndText + calculatedSurplusHours;
        // sendResponse({numHours: calculatedSurplusHours});
        
    //   } // end request greeting == 'hello'
    // });
}, 1000); // trigger every 10 seconds
