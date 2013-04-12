var teachersAdded = false,
    communicationPort = null;


function messageHandler(msg) {
    switch(msg.ID) {
        case "add_teachers":
            if (!teachersAdded) {
                var header = $($("#reg_srch_results > table > tbody > tr")[0]),
                    newHeaderItem = $("<th>Teacher(s)</th>");
                header.append(newHeaderItem);
                
                //only allow this functionality to occur once
                teachersAdded = true;
                iterateSectionRows();
            }
            break;
        case "add_teacher_data":
            var rows = $('#reg_srch_results>table>tbody>tr'),
                specifiedRow = $(rows[msg.sectionRowIndex]),
                column = null,
                html = "";
            if (specifiedRow.find("td[class='teacher_column']").length) {
                column = $(specifiedRow.find("td[class='teacher_column']")[0]);
                html = "<br>";
            } else {
                column = $("<td class='teacher_column'></td>");
                specifiedRow.append(column);
            }    
            html += '<a href="http://www.ratemyprofessors.com/SelectTeacher.jsp?searchName=' + msg.lastName + '&search_submit1=Search&sid=1100" target="_blank">' + msg.fullTextName + "</a>";
            column.append($(html));
    }
}

function iterateSectionRows() {
    // get the right term and year
    var term = 0,
        year = new Date().getFullYear() - 2000, // fugly but it works
        month = new Date().getMonth(); // will be used to pick the right year in some cases

    switch ($("#isisTitle").text().trim()) { // Hopefully they don't mess with the page layout too much
        case "Summer Courses":
            term = 5;
            break;
        case "Fall Courses":
            term = 8;
            break;
        case "Spring Courses":
            term = 1;
            // should still work during spring add/drop
            if (month > 0) { // February or later (JS month is 0-indexed!)
                year++; // you probably want next calendar year
            }
            break;
    }


    // if got a term, go through each row
    if (term > 0) {
        var rows = $('#reg_srch_results>table>tbody>tr');
        rows.each(function (rowIndex, row) {
            var submitButton = $(row).find('td>form>input[type="submit"]'),
                btnText = $(submitButton[0]).val();
            if (btnText) {
                var sectionLocation = btnText.indexOf(" ") + 1,
                    section = btnText.substr(sectionLocation);
                communicationPort.postMessage({
                    "ID": "section_iterator",
                    "section": section,
                    "rowIndex": rowIndex,
                    "term": term,
                    "year": year
                });
            }
        });
    }
}

chrome.extension.onConnect.addListener(function(thePort) {
    //user clicked context menu item
    //set up the message passing interface
    communicationPort = thePort;
    communicationPort.onMessage.addListener(messageHandler);
});
