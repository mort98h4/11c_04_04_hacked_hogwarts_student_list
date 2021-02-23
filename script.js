"use strict";

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
    responsibilities: "None",
    imageUrl: ""
};

// Settings for the global filtering and sorting variables
const settings = {
    filterBy: "*",
    sortBy: "firstName",
    sortDir: "asc"
};

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
}

async function loadJSON(url, callback) {
    const JSONData = await fetch(url);
    const students = await JSONData.json();

    callback(students);
}

function prepareStudents(jsonData) {
    allStudents = jsonData.map(prepareStudent);
    //console.table(allStudents);
    setFilter(settings.filterBy);
}

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

    // TODO: Clean the blood status

    // Clean the houses
    student.house = jsonObject.house.trim();
    student.house = student.house.substring(0, 1).toUpperCase() + student.house.substring(1).toLowerCase();

    // TODO: Clean the responsibilities

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
        } else if (student.house === filterListBy) {
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

function sortList(sortedList) {
    let direction = 1;
    if (settings.sortDir === "desc") {
        direction = -1;
    }
    sortedList = sortedList.sort(sortByProberty);

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
    const currentList = filterList(settings.filterBy);
    const sortedList = sortList(currentList);

    displayStudents(sortedList);
}

function displayStudents(students) {
    //console.log(students);
    // Clear the list
    document.querySelector("#list tbody").innerHTML = "";

    // Build a new list
    students.forEach(displayStudent);
}

function displayStudent(student) {
    //console.log(student);
    // Create the clone
    const clone = document.querySelector("template#student").content.cloneNode(true);

    // Set clone data
    clone.querySelector("[data-field=firs]").textContent = student.firstName;
    clone.querySelector("[data-field=last]").textContent = student.lastName;
    clone.querySelector("[data-field=hous]").textContent = student.house;
    clone.querySelector("[data-field=resp]").textContent = student.responsibilities;
    
    // Add click to the students in the list
    clone.querySelector("tr").addEventListener("click", showStudentDetails);
    function showStudentDetails() {
        document.querySelector("#student_details").classList.remove("hide");
        console.log(student);
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
    
        // Add eventlisteners to buttons inside the student_details modal
        document.querySelector(".content_header .close").addEventListener("click", closeStudentDetails);
        function closeStudentDetails() {
            document.querySelector(".content_header .close").removeEventListener("click", closeStudentDetails);
            document.querySelector("#student_details").classList.add("hide");
        }
        // TODO: expel, inquisitorial, prefect buttons
    }

    // Append clone to list
    document.querySelector("#list tbody").appendChild(clone);
}