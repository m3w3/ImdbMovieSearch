/* Library - JS */
"use strict";
const URL = 'https://www.omdbapi.com/?apikey=a23db7da&s='
const searchForm = document.querySelector('#search form');
const resultsDiv = document.querySelector('#results');
const resultTitleDiv = document.querySelector('#results h3');
const resultPages = document.querySelector('#results table');

let currentPage = 0;
let responseList = []; // track response from page=1, 2, ... so on
let nominatedList = []; // track nominated movies, max = 5
searchForm.addEventListener('submit', collectResult);

async function collectResult(e) {
	e.preventDefault();
	responseList = []; // reset the list of API collection

	// grab everything from API call
	let movieEntered = searchForm.querySelector('input').value;
	let omdbResultSize = await getResultSize(movieEntered);
	let noMoviesFound = (omdbResultSize == 0);
	let totalPages = Math.ceil(omdbResultSize / 10);
	console.log(`Movie: ${movieEntered}, Pages: ${totalPages}`);
	let i = 1;
	while (omdbResultSize > 0) {
		let batchSize = await callAPI(movieEntered, i);
		omdbResultSize -= batchSize;
		i++;
	}

	// what to display if no movie title matches
	if (noMoviesFound) {
		let oldList = document.querySelector('#results ul');
		let newList = document.createElement('ul');
		let newListEl = document.createElement('li');
		newListEl.innerHTML = `No movies match "${movieEntered}"!`;
		newList.appendChild(newListEl);
		resultsDiv.replaceChild(newList, oldList);
	} else {

	}

	// number of totalPages to access search results
	// within this, it'll also generate the results view
	displayPageNumber(totalPages);

	// change the heading
	resultTitleDiv.innerHTML = `Results for "${movieEntered}"`
}

async function callAPI(movieEntered, i) {
	let searchResponse = await fetch(`${URL}${movieEntered}&page=${i}`);
	if (searchResponse.ok) {
		let movieParsed = await searchResponse.json();
		let apiReturn = movieParsed['Search']
		responseList.push(apiReturn);
		return apiReturn.length
	} else {
		alert("Error: " + searchResponse.status);
	}
}

async function getResultSize(movieEntered) {
	let searchResponse = await fetch(`${URL}${movieEntered}`);
	if (searchResponse.ok) {
		let movieParsed = await searchResponse.json();
		if (movieParsed['Response'] == 'True') {
			return parseInt(movieParsed['totalResults']);
		}
		else {
			return 0;
		}
	} else {
		alert("Error: " + searchResponse.status);
	}
}

function displayPageNumber(totalPages) {
	// replace the old page body with a new and empty one
	let oldPageBody = document.querySelector('#results table tbody');
	let newPageBody = document.createElement('tbody');
	let newPageRow = document.createElement('tr');
	newPageBody.appendChild(newPageRow);
	resultPages.replaceChild(newPageBody, oldPageBody);

	// append page number to each table cell
	let j = 0;
	while (totalPages > 0) {
		let cell = newPageRow.insertCell(j);
		cell.style.minWidth = '30px'; // can take out after CSS is done
		cell.style.textAlign = 'center';
		cell.innerHTML = j + 1;
		cell.addEventListener('click', generateResultsView);
		totalPages -= 1;
		j++;
	}
	newPageRow.firstChild.click();

}

function generateResultsView(e) {
	console.log(`Clicked on ${this.innerHTML}`);
	// create the UI for all the movie results in this page number
	let currentPageNum = parseInt(this.innerHTML);
	let resultsOnCurrentPage = responseList[currentPageNum - 1];
	let oldList = document.querySelector('#results ul');
	let newList = document.createElement('ul');
	for(let i = 0; i < resultsOnCurrentPage.length; i++) {
		let newListEl = document.createElement('li');
		let ithResult = resultsOnCurrentPage[i]
		newListEl.innerHTML = `${ithResult["Title"]} (${ithResult["Year"]}) Type: ${ithResult["Type"]}`;
		newList.appendChild(newListEl);
	}
	resultsDiv.replaceChild(newList, oldList);
}





// Book 'class'
class Book {
	constructor(title, author, genre) {
		this.title = title;
		this.author = author;
		this.genre = genre;
		this.patron = null; // will be the patron objet

		// set book ID
		this.bookId = numberOfBooks;
		numberOfBooks++;
	}

	setLoanTime() {
		// Create a setTimeout that waits 3 seconds before indicating a book is overdue

		const self = this; // keep book in scope of anon function (why? the call-site for 'this' in the anon function is the DOM window)
		setTimeout(function() {
			
			console.log('overdue book!', self.title)
			changeToOverdue(self);

		}, 3000)

	}
}