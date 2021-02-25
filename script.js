"use strict";

// Wait for the DOM to be loaded, then call init()
window.addEventListener("DOMContentLoaded", init);

let allStudents = [];

// Prototype for all the students
const Student = {
    firstName: "",
    middleName: "",
    nickName: "",
    lastName: "",
    gender: "",
    bloodStatus: "",
    house: "",
    responsibilities: "",
    prefect: false,
    inquisitorial: false,
    imageUrl: ""
};

// Settings for the global filtering and sorting variables
const settings = {
    filterBy: "*",
    sortBy: "firstName",
    sortDir: "asc"
};

// When the DOM is loaded, make filter and sort buttons clickable. Begin fetching JSON.
function init() {
    console.log("init");

    // Add eventlisteners for filtering and sorting buttons
    document.querySelectorAll("[data-action='filter']").forEach(button => {
        button.addEventListener("click", selectFilter);
    });
    document.querySelectorAll("[data-action='sort']").forEach(button => {
        button.addEventListener("click", selectSort);
    });

    loadJSON("https://petlatkea.dk/2021/hogwarts/students.json", prepareStudents);
    loadJSON("https://petlatkea.dk/2021/hogwarts/families.json", prepareBloodStatuses);
}

// Fetch JSON data
async function loadJSON(url, callback) {
    const JSONData = await fetch(url);
    const students = await JSONData.json();

    callback(students);
}

// Set the JSON data to the allStudents array
function prepareStudents(jsonData) {
    allStudents = jsonData.map(prepareStudent);
    //console.table(allStudents);
    setFilter(settings.filterBy);
}

function prepareBloodStatuses(jsonData) {
    allStudents.forEach(student => {
        student.bloodStatus = "Muggle born";
        for (let i = 0; i < 63; i++) {
            if (student.lastName === jsonData.pure[i]) {
                student.bloodStatus = "Pure blood";
            } 
        }
        for (let i = 0; i < 13; i++) {
            if (student.lastName === jsonData.half[i]) {
                student.bloodStatus = "Half blood";
            }
        }
    });
}

// Clean the JSON data in objects, and return to the allStudent array
function prepareStudent(jsonObject) {
    const student = Object.create(Student);

    const trimmedNames = jsonObject.fullname.trim();
    const firstSpace = trimmedNames.indexOf(" ");
    const lastSpace = trimmedNames.lastIndexOf(" ");

    // Clean the first names
    if (firstSpace == -1) {
        student.firstName = trimmedNames;
    } else {
        student.firstName = trimmedNames.substring(0, firstSpace);
    }
    student.firstName = student.firstName.substring(0, 1).toUpperCase() + student.firstName.substring(1).toLowerCase();

    // Clean the middle names and nick names
    student.middleName = trimmedNames.substring(firstSpace, lastSpace).trim();
    if (student.middleName.substring(0,1) == `"`) {
        student.nickName = student.middleName;
        student.middleName = "";
        student.nickName = student.nickName.substring(0, 1) + student.nickName.substring(1, 2).toUpperCase() + student.nickName.substring(2).toLowerCase();
    } else {
        student.nickName = "";
        student.middleName = student.middleName.substring(0, 1).toUpperCase() + student.middleName.substring(1).toLowerCase();
    }

    // Clean the last names
    if (lastSpace == -1) {
        student.lastName = "";
    } else {
        student.lastName = trimmedNames.substring(lastSpace + 1);
    }
    const ifHyphens = student.lastName.indexOf("-");
    if (ifHyphens == -1) {
        student.lastName = student.lastName.substring(0, 1).toUpperCase() + student.lastName.substring(1).toLowerCase();
    } else {
        student.lastName = student.lastName.substring(0, 1).toUpperCase() + student.lastName.substring(1, ifHyphens+1).toLowerCase() + student.lastName.substring(ifHyphens+1, ifHyphens+2).toUpperCase() + student.lastName.substring(ifHyphens+2).toLowerCase();
    }

    // Clean the genders 
    student.gender = jsonObject.gender.trim();
    student.gender = student.gender.substring(0, 1).toUpperCase() + student.gender.substring(1).toLowerCase();
    if (student.gender === "Girl") {
        student.gender = "Witch";
    } else if (student.gender === "Boy") {
        student.gender = "Wizard";
    }

    // Clean the houses
    student.house = jsonObject.house.trim();
    student.house = student.house.substring(0, 1).toUpperCase() + student.house.substring(1).toLowerCase();

    // Add the image urls
    if (ifHyphens == -1) {
        student.imageUrl = `images/students/${student.lastName.toLowerCase()}_${student.firstName.substring(0,1).toLowerCase()}.png`;
    } else {
        student.imageUrl = `images/students/${student.lastName.substring(ifHyphens + 1).toLowerCase()}_${student.firstName.substring(0,1).toLowerCase()}.png`;
    }

    return student;
}

// The user selected filter 
function selectFilter() {
    const filter = this.dataset.filter;
    setFilter(filter);
} 

// Sets the user selected filter as the filter used to filtrate the list
function setFilter(filter) {
    settings.filterBy = filter;
    buildList();
}

// The function that defines the filtered list
function filterList(filterListBy) {
    const filteredList = allStudents.filter(isStudentFilter);

    function isStudentFilter(student) {
        if (filterListBy === "*") {
            return allStudents;
        } else if (student.house.toLowerCase() === filterListBy.toLowerCase()) {
            return true;
        }
        // TODO: Add more filters
        // TODO: Make special condition for showing only the expelled students. 
        //       It might have something to do with a new array. Who knows.
    }
    
    return filteredList;
}

// The user seleceted sorting
function selectSort() {
    console.log(this.dataset.sort);
    const sortBy = this.dataset.sort;
    const sortDir = this.dataset.sortDirection;

    // Find the element with class sortby, and remove the class
    document.querySelector(`[data-sort='${settings.sortBy}']`).classList.remove("sortby");

    // TODO: Indicate active sorting
    this.classList.add("sortby");

    // Toggle the sorting direction
    if (sortDir === "asc") {
        this.dataset.sortDirection = "desc";
    } else {
        this.dataset.sortDirection = "asc";
    }

    setSort(sortBy, sortDir);
}

// Sets the user selected sorting as the sort used to sort the list
function setSort(sortBy, sortDir) {
    settings.sortBy = sortBy;
    settings.sortDir = sortDir;
    console.log(settings.sortBy);
    buildList();
}

// Sorts the filtered list
function sortList(filteredList) {
    let direction = 1;
    if (settings.sortDir === "desc") {
        direction = -1;
    }
    const sortedList = filteredList.sort(sortByProberty);

    function sortByProberty(studentA, studentB) {
        if (studentA[settings.sortBy] < studentB[settings.sortBy]) {
            return -1 * direction;
        } else {
            return 1 * direction;
        }
    }
    return sortedList;
}

// The function that delegates the filter and the sorting
function buildList() {
    const filteredList = filterList(settings.filterBy);
    const sortedList = sortList(filteredList);

    displayStudents(sortedList);
}

// Displays the list of students
function displayStudents(students) {
    //console.log(students);
    // Clear the list
    document.querySelector("#list tbody").innerHTML = "";

    // Build a new list
    students.forEach(displayStudent);
}

// Display each student of the list
function displayStudent(student) {
    //console.log(student);
    // Create the clone
    const clone = document.querySelector("template#student").content.cloneNode(true);

    // Set clone data
    clone.querySelector("[data-field=firs]").textContent = student.firstName;
    clone.querySelector("[data-field=last]").textContent = student.lastName;
    clone.querySelector("[data-field=hous]").textContent = student.house;

    // Changes the proberty of student.responsibilities depending on prefect and inquisiorial values
    if (student.prefect === true && student.inquisitorial === false) {
        student.responsibilities = `Prefect`;
    } else if (student.prefect === false && student.inquisitorial === true) {
        student.responsibilities = `Inquisitorial squad member`;
    } else if (student.prefect === true && student.inquisitorial === true) {
        student.responsibilities = `Prefect, Inquisitorial squad member`;
    } else {
        student.responsibilities = "";
    }
    clone.querySelector("[data-field=resp]").textContent = student.responsibilities;

    // Add click to the students in the list
    clone.querySelector("tr").addEventListener("click", clickStudentDetails);
    function clickStudentDetails() {
        showStudentDetails(student);
    }
    
    // Append clone to list
    document.querySelector("#list tbody").appendChild(clone);
}

// Displays the modal with a specific students details
function showStudentDetails(student) {
    document.querySelector("#student_details").classList.remove("hide");

    // Insert the specific student's details
    document.querySelector(".col_left h3").textContent = `${student.lastName}, ${student.firstName.substring(0,1)}.`;
    document.querySelector(".col_left [data-field=firs]").textContent = student.firstName;
    document.querySelector(".col_left [data-field=midd]").textContent = student.middleName;
    document.querySelector(".col_left [data-field=nick]").textContent = student.nickName;
    document.querySelector(".col_left [data-field=last]").textContent = student.lastName;
    document.querySelector(".col_left [data-field=gend]").textContent = student.gender;
    document.querySelector(".col_left [data-field=bloo]").textContent = student.bloodStatus;
    document.querySelector(".col_left [data-field=hous]").textContent = student.house;
    document.querySelector(".col_left [data-field=resp]").textContent = student.responsibilities;
    document.querySelector(".col_right img").src = student.imageUrl;
    document.querySelector(".col_right img").alt = `Portrait of ${student.firstName} ${student.lastName}`;

    // Update button texts depending on responsibilities
    if (student.prefect === true && student.inquisitorial === false) {
        document.querySelector("#student_details [data-field=makePrefect]").textContent = `Remove`;
        document.querySelector("#student_details [data-field=makeInqu]").textContent = `Make`;
    } else if (student.prefect === false && student.inquisitorial === true) {
        document.querySelector("#student_details [data-field=makeInqu]").textContent = `Remove as`;
        document.querySelector("#student_details [data-field=makePrefect]").textContent = `Make`;
    } else if (student.prefect === true && student.inquisitorial === true) {
        document.querySelector("#student_details [data-field=makePrefect]").textContent = `Remove`;
        document.querySelector("#student_details [data-field=makeInqu]").textContent = `Remove as`;
    } else {
        document.querySelector("#student_details [data-field=makePrefect]").textContent = `Make`;
        document.querySelector("#student_details [data-field=makeInqu]").textContent = `Make`;
    }

    // Add click to close
    document.querySelector(".content_header .close").addEventListener("click", closeStudentDetails);
    function closeStudentDetails() {
        document.querySelector(".content_header .close").removeEventListener("click", closeStudentDetails);
        document.querySelector("#student_details").classList.add("hide");
    }

    // Add click to prefect button
    document.querySelector(".make_prefect").addEventListener("click", clickMakePrefect);
    function clickMakePrefect() {
        console.log("clickMakePrefect");
        // Remove click eventlisteners
        document.querySelector("#student_details .make_prefect").removeEventListener("click", clickMakePrefect);
        document.querySelector("#student_details .make_inqu").removeEventListener("click", clickMakeInqu);
        if (student.prefect === true) {
            student.prefect = false;
        } else {
            tryToMakePrefect(student);
        }
        closeStudentDetails();
        buildList();
    }

    // Add click to inqisitorial squad button
    document.querySelector("#student_details .make_inqu").addEventListener("click", clickMakeInqu);
    function clickMakeInqu() {
        console.log("clickMakeInqu");
        // Remove click eventlisteners
        document.querySelector("#student_details .make_prefect").removeEventListener("click", clickMakePrefect);
        document.querySelector("#student_details .make_inqu").removeEventListener("click", clickMakeInqu);
        if (student.inquisitorial === true) {
            student.inquisitorial = false;
        } else {
            tryToMakeInqu(student);
            buildList();
        }
        closeStudentDetails();
        buildList();
    }
    // TODO: expel
}

// Make a student prefect
function tryToMakePrefect(selectedStudent) {
    // Create an array of students whom is form the same house and of same gender
    const prefects = allStudents.filter(student => student.prefect === true);
    const prefectsPerHouse = prefects.filter(student => student.house === selectedStudent.house);
    const ofSameHouseAndGender = prefectsPerHouse.filter(student => student.gender === selectedStudent.gender).shift();

    // If no other student is from the same house or of the same gender, 
    // make the selected student prefect. If not, go to removeOtherPrefect. 
    if (ofSameHouseAndGender !== undefined) {
        removeOtherPrefect();
    } else {
        makePrefect(selectedStudent);
    }

    function removeOtherPrefect() {
        // Show #remove_other dialog box, and add eventlisteners to buttons.
        document.querySelector("#remove_other").classList.remove("hide");
        document.querySelector("#remove_other .close").addEventListener("click", closeDialog);
        document.querySelector("#remove_other .remove_other_prefect").addEventListener("click", clickRemovePrefect);

        // Add name to button
        document.querySelector("#remove_other [data-field=selectedStudent]").textContent = `${ofSameHouseAndGender.firstName} ${ofSameHouseAndGender.lastName}`;

        // Don't remove the original prefect
        function closeDialog() {
            document.querySelector("#remove_other").classList.add("hide");
            document.querySelector("#remove_other .close").removeEventListener("click", closeDialog);
            document.querySelector("#remove_other .remove_other_prefect").removeEventListener("click", clickRemovePrefect);    
        }

        // Remove the original prefect
        function clickRemovePrefect(){
            document.querySelector("#remove_other .remove_other_prefect").removeEventListener("click", clickRemovePrefect);
            removePrefect(ofSameHouseAndGender);
            makePrefect(selectedStudent);
            buildList();
            closeDialog();
        }
    }

    // Removes the original prefect, by setting the proberty to false
    function removePrefect(ofSameHouseAndGender) {
        ofSameHouseAndGender.prefect = false;
    }

    // Makes the selected student prefect, by setting the proberty to true
    function makePrefect(selectedStudent) {
        selectedStudent.prefect = true;
    }
}

// Make a student an inquisitorial squadront
function tryToMakeInqu(selectedStudent) {
    document.querySelector("#make_inqu").classList.remove("hide");

    // Add click to close button
    document.querySelector("#make_inqu .close").addEventListener("click", closeDialog);
    function closeDialog() {
        document.querySelector("#make_inqu").classList.add("hide");
        document.querySelector("#make_inqu .close").removeEventListener("click", closeDialog);

    }

    // If student is a pure blood, add selected students name to button and create message
    if (selectedStudent.bloodStatus === "Pure blood") {
        document.querySelector("#make_inqu [data-field=inqumessage]").textContent = `${selectedStudent.firstName} ${selectedStudent.lastName} is a ${selectedStudent.bloodStatus.toLowerCase()} ${selectedStudent.gender.toLowerCase()}, and is eligible for the Inquisitorial Squad!`;
        document.querySelector("#make_inqu [data-field=selectedStudent]").textContent = `${selectedStudent.firstName} ${selectedStudent.lastName}`;
        document.querySelector("#make_inqu .make_inqu").style.display = "block";
        document.querySelector("#make_inqu .make_inqu").addEventListener("click", clickInquButton);
    } 
    // If not, hide button and change message
    else {
        document.querySelector("#make_inqu .make_inqu").removeEventListener("click", clickInquButton);
        document.querySelector("#make_inqu [data-field=inqumessage]").textContent = `${selectedStudent.firstName} ${selectedStudent.lastName} is a ${selectedStudent.bloodStatus.toLowerCase()} ${selectedStudent.gender.toLowerCase()}, and is not eligible for the Inquisitorial Squad!`;
        document.querySelector("#make_inqu .make_inqu").style.display = "none";
    }

    // Click on inquisition button
    function clickInquButton() {
        document.querySelector("#make_inqu .make_inqu").removeEventListener("click", clickInquButton);
        makeInqu(selectedStudent);
        buildList();
        closeDialog();
    }

    // Make student inquisition squad member by setting proberty to true
    function makeInqu(selectedStudent) {
        selectedStudent.inquisitorial = true;
    }
}
