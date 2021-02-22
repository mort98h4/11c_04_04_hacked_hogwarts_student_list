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
    filterBy: "all",
    sortBy: "hous",
    sortDir: "asc"
};

function init() {
    console.log("init");

    // TODO: Add eventlisteners for filtering and sorting buttons

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

    // TODO: This might not be the function we want to call first
    displayStudents(allStudents);
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

    // Append clone to list
    document.querySelector("#list tbody").appendChild(clone);
}