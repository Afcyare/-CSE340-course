'use strict'

// Get a list of items in inventory based on the classification_id 
let classificationList = document.querySelector("#classification_id")
classificationList.addEventListener("change", function () { 
 let classification_id = classificationList.value 
 console.log(`classification_id is: ${classification_id}`) 
 let classIdURL = "/inv/getInventory/"+classification_id 
 console.log("Making request to:", classIdURL); // ADD THIS
  
 // Clear the table while loading
 let inventoryDisplay = document.getElementById("inventoryDisplay");
 inventoryDisplay.innerHTML = '<tr><td colspan="3">Loading...</td></tr>';
  
 console.log("Starting fetch request..."); // ADD THIS
 fetch(classIdURL) 
 .then(function (response) { 
  console.log("Response received, status:", response.status); // ADD THIS
  if (response.ok) { 
   return response.json(); 
  } 
  throw Error("Network response was not OK. Status: " + response.status); 
 }) 
 .then(function (data) { 
  console.log("Received data:", data); 
  buildInventoryList(data); 
 }) 
 .catch(function (error) { 
  console.log('There was a problem: ', error.message);
  inventoryDisplay.innerHTML = '<tr><td colspan="3">Error loading inventory. Please try again. Error: ' + error.message + '</td></tr>';
 }) 
})

// Build inventory items into HTML table components and inject into DOM 
function buildInventoryList(data) { 
 let inventoryDisplay = document.getElementById("inventoryDisplay"); 
 
 // Clear the table
 inventoryDisplay.innerHTML = '';
 
 // Check if data is empty
 if (!data || data.length === 0) {
   console.log("No data or empty array received"); 
   inventoryDisplay.innerHTML = '<tr><td colspan="3">No vehicles found for this classification.</td></tr>';
   return;
 }
 
 // Set up the table labels 
 let dataTable = '<thead>'; 
 dataTable += '<tr><th>Vehicle Name</th><td>&nbsp;</td><td>&nbsp;</td></tr>'; 
 dataTable += '</thead>'; 
 // Set up the table body 
 dataTable += '<tbody>'; 
 // Iterate over all vehicles in the array and put each in a row 
 data.forEach(function (element) { 
  console.log(element.inv_id + ", " + element.inv_model); 
  dataTable += `<tr><td>${element.inv_make} ${element.inv_model}</td>`; 
  dataTable += `<td><a href='/inv/edit/${element.inv_id}' title='Click to update'>Modify</a></td>`; 
  dataTable += `<td><a href='/inv/delete/${element.inv_id}' title='Click to delete'>Delete</a></td></tr>`; 
 }) 
 dataTable += '</tbody>'; 
 // Display the contents in the Inventory Management view 
 inventoryDisplay.innerHTML = dataTable; 
}