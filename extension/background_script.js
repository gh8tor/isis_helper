var communicationPort;

function addProfessorNames(info, tab) {
    var tabID = tab.id;
    
    communicationPort = chrome.tabs.connect(tabID);
    communicationPort.onMessage.addListener(handleMessage);
    communicationPort.postMessage({"ID": "add_teachers"});
}

function handleMessage(msg) {
    if (msg.ID === "section_iterator") {
            lookupSection(msg.section, msg.rowIndex, msg.term, msg.year);
    }
}

function lookupSection(section, rowIndex, term, year) {
    $.get('http://www.bsd.ufl.edu/textadoption/studentview/displayadoption1sect.aspx?SECT=' + section + '&YEAR=' + year + '&TERM=' + term, {}, function (results) {
        var content = $(results),
            instructorsData = $(content.find("#formArea td[class='h2 instructor']", results)[0]).text(),
            instructorsText = $.trim(instructorsData),
            allInstructors = instructorsText.split(";");
        $(allInstructors).each(function(index, instructor) {
            var fullName = $.trim(instructor);
            if (fullName.indexOf(",") >= 0) {
                var nameParts = fullName.split(","),
                    lastName = nameParts[0];
                    
				sendTeachDataToPage(rowIndex, fullName, lastName);
            }
        });
    }, "html");
}


function sendTeachDataToPage(rowIndex, fullName, lastName) {
    communicationPort.postMessage({
        "ID": "add_teacher_data",
        "sectionRowIndex": rowIndex,
        "fullTextName": fullName,
        "lastName": lastName
    });
}

var id = chrome.contextMenus.create({
    "title": "Add professor names", 
    "contexts": ["page"], 
    "documentUrlPatterns": ["*://*.isis.ufl.edu/cgi-bin/nirvana*"],
    "onclick": addProfessorNames
});

