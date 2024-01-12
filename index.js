const registerServiceWorker = async () => {
    if ("serviceWorker" in navigator) {
        try {
            const registration = await navigator.serviceWorker.register("sw.js", {
                scope: "./",
            });
            if (registration.installing) {
                console.log("Service worker installing");
            } else if (registration.waiting) {
                console.log("Service worker installed");
            } else if (registration.active) {
                console.log("Service worker active");
            }
        } catch (error) {
            console.error(`Registration failed with ${error}`);
        }
    }
};

registerServiceWorker();






// The list of suras that the user knows
const suras = []

// The key in the storage to the suras array
const surasKey = "suras";

// Get html element that we will display the suras in
const surasContainer = document.querySelectorAll(".known-suras-container")[0];


// Returns html element that will get displayed using the sura's name
function SuraHtml(suraName) {
    // suraName = suraName.replace("\\", "\\\\").replace("\"", "\\\"").replace("'", "\\'");
    return '<span onclick="DeleteSurah(\'' + suraName + '\')" class="surah-name">' + suraName + ' &#x2A09;</span>';
}

// Loads already existing suras from local storage
function LoadSuras() {
    // Get the suras
    var storedSuras = localStorage.getItem(surasKey);

    // If we didn't get anything
    if (storedSuras == null)
        // Exist out of the function
        return;

    // Delete any existing content
    suras.splice(0, suras.length);

    // Add the suras to the list of suras that we have in memory
    suras.push(...JSON.parse(storedSuras));

    // Clear the content of the suras container
    surasContainer.innerHTML = "";

    // For each sura
    suras.forEach(sura => {
        // Add it to the html element
        surasContainer.innerHTML += SuraHtml(sura);
    });
}

// Adds a sura to the list of suras that the user knows
function AddSurah(surahName) {
    // Remove white space from edges
    var trimmed = surahName.trim();

    // If it is empty
    if (trimmed == undefined || trimmed == null || trimmed == "")
        // Don't do anything    
        return;

    // Check if there is a sura with the same name already
    var matched = suras.filter(x => (x == trimmed));

    // If there is
    if (matched.length > 0)
        // Don't do anything    
        return;

    // Add the sura to the list of suras
    suras.push(trimmed);

    // Display it on the screen
    surasContainer.innerHTML += SuraHtml(trimmed);

    // Update suras list on local storage
    localStorage.setItem(surasKey, JSON.stringify(suras));
}

// Deletes a sura from the list of suras and UI
function DeleteSurah(surahName) {
    // Remove white space from edges
    var trimmed = surahName.trim();

    // If it is empty
    if (trimmed == undefined || trimmed == null || trimmed == "")
        // Don't do anything    
        return;

    // Check if there is a sura with the same name
    var matched = suras.filter(x => (x == trimmed));
    // If there isn't 
    if (matched.length == 0)
        // Don't do anything    
        return;

    // Remove the sura from the list of suras
    suras.splice(suras.indexOf(matched[0]), 1);

    // Update local storage to the new list of suras
    localStorage.setItem(surasKey, JSON.stringify(suras));

    // Update UI
    LoadSuras();
}


// Displays to the user two random suras from the list of suras that he knows
function ShuffleSuras() {
    // If there are no suras
    if (suras.length == 0)
        // Don't do anything
        return;

    // Get the html element that will contain the randomly picked suras
    var shffledSurasContainer = document.querySelector(".suras-to-use");

    // Get two random indexes in the suras list
    var index1 = Math.floor(Math.random() * suras.length);
    var index2 = Math.floor(Math.random() * suras.length);

    // Clear any existing content in the container
    shffledSurasContainer.innerHTML = "";

    // Add the two suras to the container
    shffledSurasContainer.innerHTML += '<span class="selected-surah-name">' + suras[index1] + '</span>';
    shffledSurasContainer.innerHTML += '<span class="selected-surah-name">' + suras[index2] + '</span>';
}


// Load suras from local storage and display them to the user
LoadSuras();

// Get the add surah button
var newSurahButton = document.querySelector("#add-surah-button");

// Get the text area that will contain the name of the sura
var newSurahTextArea = document.querySelector(".new-surah-text-area");

// When the new surah button gets clicked
newSurahButton.onclick = () => {
    // Add a new surah to the list of suras
    AddSurah(newSurahTextArea.value);
}

// On page load, select two random suras and show them to the user
ShuffleSuras();