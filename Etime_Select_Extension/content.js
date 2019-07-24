function selectElement(e) {
    var x = e.clientX, y = e.clientY,
        elementMouseIsOver = document.elementsFromPoint(x, y);

    // get the raw text inside selected element
    var raw_text = elementMouseIsOver[0].textContent;
    // console.log(elementMouseIsOver[0]); // for debug
    
    // select raw text if not empty and of proper class name
    if (raw_text.length > 0 && elementMouseIsOver[0].className === "u") {
        window.getSelection().selectAllChildren(elementMouseIsOver[0]);
    }
}

$(window).click(selectElement);





// function isWorkday(num) {
//     if num. hrs0_i
// }

var endDateInitVal = '';
var workdaysDict = [];
var daysInMonth = 0;

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      if (request.greeting == "hello") {
        
        var iframe = document.getElementById('unitFrame');
        if (iframe == null)
            return;
        
        var innerDoc = iframe.contentDocument || iframe.contentWindow.document;
        if (innerDoc == null)
            return;
        
        var totalHours = innerDoc.getElementById('grandTotal2');
        if (totalHours == null)
            return;
        
        var endingDateBox = innerDoc.getElementById('endingDateSpan');
        if (endingDateBox == null)
            return;
        if (endDateInitVal == '') { // check if init box val has been grabbed yet (only grab once)
            endDateInitVal = endingDateBox.textContent;
            daysInMonth = endingDateBox.textContent.split(' ')[1].split(',')[0]; // get number of days in month
            // create dict of days that are workdays 
            // for (i=0; i<daysInMonth; i++){
            //     workdaysDict[i] = isWorkday(i);
            // }

        }
        
        
        
        var calculatedSurplusHours = totalHours.textContent;
        endingDateBox.textContent = endDateInitVal + calculatedSurplusHours;
        sendResponse({numHours: 'end date: ' + daysInMonth}); //'calculated surplus hours:' + calculatedSurplusHours});
        

      }
        
    });
