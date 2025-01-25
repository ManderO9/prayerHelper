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

// registerServiceWorker();






// The list of suras that the user knows
const suras = []

// The key in the storage to the suras array
const surasKey = "suras";
const rotationKey = "suras_rotation";

// Get html element that we will display the suras in
const surasContainer = document.querySelector("#suras-list-container");

// Returns html element that will get displayed using the sura's name
function SuraHtml(suraName, first) {
    if(first)
        return '<div onclick="RotateSurah()"><span>' + suraName + '</span><span>&#x2A09;</span></div>';

    return '<div><span>' + suraName + '</span></div>';
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

    // Get the number of rotations to do
    var rotations = localStorage.getItem(rotationKey) ?? 0;
    rotations = rotations % suras.length;

    // Rotate the suras a set number of times so they are at the order they last were at
    const newSuras = [];
    for(var k = 0; k < suras.length; k++){
        newSuras.push(suras[(k + rotations) % suras.length]);
    }

    var first = true;
    // For each sura
    newSuras.forEach(sura => {

        // Add it to the html element
        surasContainer.innerHTML += SuraHtml(sura, first);
        first = false;
    });

    for(var i = 0; i < surasContainer.children.length; i++){
        let element = surasContainer.children[i];
        element.ondblclick = () => {
            ShowNotification("Are you sure you want to delete this surah: "+ element.textContent, element.textContent);
        };
    }
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

function Delay(time) {
    return new Promise((resolve) => {
        setTimeout(() => resolve(), time);
    });
}

async function RotateSurah(){
    if(surasContainer.children.length < 2)
        return;

    var firstSurah = surasContainer.children[0];
    var secondSurah = surasContainer.children[1];

    surasContainer.classList.add("animate-suras-list")
    await Delay(300);

    var cross = firstSurah.children[1];
    firstSurah.removeChild(cross);
    secondSurah.appendChild(cross);

    surasContainer.removeChild(firstSurah);    
    surasContainer.appendChild(firstSurah);

    surasContainer.classList.remove("animate-suras-list")
    
    firstSurah.onclick = () => {};
    secondSurah.onclick = RotateSurah;

    var rotations = localStorage.getItem(rotationKey) ?? 0;
    rotations++;
    localStorage.setItem(rotationKey, rotations);
}



function ShowNotification(message, surahName) {

    const notificationOverlay = document.createElement("div");
    notificationOverlay.classList.add("notification-container");
    notificationOverlay.onclick = () => {
        document.body.removeChild(notificationOverlay);
    }

    var content = document.createElement("div");
    notificationOverlay.appendChild(content);

    var messageElement = document.createElement("div");
    messageElement.textContent = message;
    content.appendChild(messageElement);
    
    var closeButton = document.createElement("button");
    closeButton.classList.add("action-button");
    closeButton.textContent = "Delete";
    content.appendChild(closeButton);

    closeButton.onclick = () => {
        DeleteSurah(surahName);
        document.body.removeChild(notificationOverlay);
    }
    
    document.body.appendChild(notificationOverlay);
}
