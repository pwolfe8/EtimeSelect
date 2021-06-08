// Unused. Keeping in case want to do any messaging to popup html

// document.addEventListener('DOMContentLoaded', function() {
//     console.log('hello there');

//     var iframe = document.getElementById('gtmenu');
//     if (iframe != null){
//         document.getElementById('hours').textContent = "got it!";
//         totalHours = iframe.getElementById('grandTotal2');
//         document.getElementById('hours').textContent = "got grand total";
//     } else {
//         document.getElementById('hours').textContent = "can't find outeme";
//     }
    
console.log('hello there...');  
window.open("https://cp.gtri.gatech.edu/masterPage.htm#A0");
// window.open("https://cp.gtri.gatech.edu/masterPage.htm#A0", "_blank")

//     // var button = document.getElementById('changelinks');
//     // button.addEventListener('click', function () {
//     //     $('#status').html('Clicked change links button');
//     //     var text = $('#linkstext').val();
//     //     if (!text) {
//     //         $('#status').html('Invalid text provided');
//     //         return;
//     //     }
//     //     chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
//     //         chrome.tabs.sendMessage(tabs[0].id, {data: text}, function(response) {
//     //             $('#status').html('changed data in page');
//     //             console.log('success');
//     //         });
//     //     });
//     // });
// });

// setInterval(function() {
//     chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
//         chrome.tabs.sendMessage(tabs[0].id, {greeting: "hello"}, function(response) {
//             document.getElementById('hours').textContent = response.numHours;
//         });
//     });
//     // method to be executed;
//   }, 1000); // trigger every 1 seconds
