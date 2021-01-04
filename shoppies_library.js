/* Library - JS */
"use strict";
const URL = 'https://www.omdbapi.com/?apikey=a23db7da&s=';
const NO_IMAGE = 'https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg';
const ALERT = 'https://commons.wikimedia.org/wiki/File:OOjs_UI_icon_alert-yellow.svg';
const NOMINATION_LIMIT = 5;
let responseList = []; // track response from page=1, 2, ... so on
let nominatedMovies = new Set(); // track nominated movies, max = 5

$(function(){
	// generate API results UI when user initiates search
	$("#search form").on('submit', function(event) {
		event.preventDefault();
		collectResult();
	});
	// TODO: generate nominate section
});


const searchForm = document.querySelector('#search form');
const resultsDiv = document.querySelector('#resultsDiv');
const resultTitleDiv = document.querySelector('#resultsDiv h2');
const resultPages = document.querySelector('#resultsDiv table');

async function collectResult() {
	responseList = []; // reset the list of API collection
	let movieEntered = searchForm.querySelector('input').value;
	let omdbResultSize = await getResultSize(movieEntered);
	let noMoviesFound = (omdbResultSize == 0);
	let totalPages = Math.ceil(omdbResultSize / 10);
	// console.log(`Movie: ${movieEntered}, Pages: ${totalPages}`);
	let i = 1;
	while (omdbResultSize > 0) {
		let batchSize = await callAPI(movieEntered, i);
		omdbResultSize -= batchSize;
		i++;
	}
	// what to display if no movie title matches
	if (noMoviesFound) {
		$('.listUI').empty();
		$('#resultsDiv tr').empty();
		$('.listUI').append(`<p>No movies match "${movieEntered}"!</p>`);
	} else {
		displayPageNumber(totalPages);
	}

	// change the heading
	$('#resultsDiv h2').html(`Results for "${movieEntered}"`);
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
	$('#resultsDiv table').empty();
	let $pageNums = $('<tr>');
	$('#resultsDiv table').append($pageNums);
	// append page number to each table cell
	let j = 0;
	while (totalPages > 0) {
		let $cell = $('<td>', {'style': 'min-width: 30px; text-align: center;'});
		$cell.html(`${j + 1}`);
		console.log(`${$cell.html()}`)
		$cell.click(generateResultsView);
		$pageNums.append($cell);
		totalPages -= 1;
		j++;
	}
	if ($('#resultsDiv td').first() != null){
		$('#resultsDiv td').first().click();
	}
}

function generateResultsView(e) {
	console.log(`Clicked on page ${this.innerHTML}`);
	// create the UI for all the movie results in this page number
	let resultsOnCurrentPage = responseList[this.innerHTML - 1];
	$('#resultsDiv .listUI').empty();
	for(let i = 0; i < resultsOnCurrentPage.length; i++) {
		let ithResult = resultsOnCurrentPage[i];
		let $cell = $('<div>', {'class': 'singleMovie', 'imdbID': `${ithResult["imdbID"]}`});
		$cell.append(`<img src=${ithResult["Poster"]} onerror=this.src='${NO_IMAGE}'; width="200">`);
		$cell.append(`<h4>${ithResult["Title"]} (${ithResult["Year"]})</h4>`);
		$cell.append(`<p>Type: ${ithResult["Type"]}</p>`);
		$cell.append(createNominateButton(ithResult["imdbID"]));
		$cell.append(`<br></br>`);
		$('#resultsDiv .listUI').append($cell);
	}
}

function createNominateButton(imdbID){
	let $nominateButton = $('<button>', {'type': 'button'});
	if (nominatedMovies.has(imdbID)) {
		$nominateButton.html('Remove');
	} else {
		$nominateButton.html('Nominate');
	}
	$nominateButton.click(function(e) {
		processNominate(imdbID, this);
	});
	return $nominateButton;
}

function processNominate(imdbID, button) {
	if (nominatedMovies.has(imdbID)) {
		nominatedMovies.delete(imdbID);
		button.innerHTML = 'Nominate';
<<<<<<< HEAD
	}
	else {
		if (nominatedMovies.size < NOMINATION_LIMIT) {
			nominatedMovies.add(imdbID);
			// TODO: create the UI in under the nominated header UI
			button.innerHTML = 'Remove';
		} else {
			// alert user to remove a nomination
			// TODO: google "javascript popup with timer"
			// https://www.w3schools.com/howto/howto_js_alert.asp
			let limitAlert = document.createElement('p');
			limitAlert.innerHTML = `Max of ${NOMINATION_LIMIT} nominations!\nRemove some!`;
			button.after(limitAlert);
		}
=======
>>>>>>> 6fa8f08aa703baaa62d48497888ca44a9ff28f19
	}
	else {
		if (nominatedMovies.size < NOMINATION_LIMIT) {
			nominatedMovies.add(imdbID);
			// TODO: create the UI in under the nominated header UI
			button.innerHTML = 'Remove';
		} else {
			// alert user to remove a nomination
			// TODO: google "javascript popup with timer"
			// https://www.w3schools.com/howto/howto_js_alert.asp
			let limitAlert = document.createElement('p');
			limitAlert.innerHTML = `Max of ${NOMINATION_LIMIT} nominations!\nRemove some!`;
			button.after(limitAlert);
		}
	}
}
