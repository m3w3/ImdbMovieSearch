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
	// TODO: add a 'loading' screen when API is loading
	// https://www.w3schools.com/howto/howto_css_loading_buttons.asp
	// https://www.w3schools.com/howto/howto_css_loader.asp
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
	let i = 1;
	while (omdbResultSize > 0) {
		let batchSize = await callAPI(movieEntered, i);
		omdbResultSize -= batchSize;
		i++;
	}
	// what to display if no movie title matches
	if (noMoviesFound) {
		$('#resultsDiv .listUI').empty();
		$('#resultsDiv tr').empty();
		$('#resultsDiv .listUI').append(`<p>No movies match "${movieEntered}"!</p>`);
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
	$('.pagination').empty();
	$('.pagination').append('<tr></tr>');
	// append page number to each table cell
	let j = 0;
	while (totalPages > 0) {
		let $cell = $('<td>', {'style': 'min-width: 30px; text-align: center;'});
		$cell.html(`${j + 1}`);
		$cell.click(generateResultsView);
		$('.pagination tr').append($cell);
		totalPages -= 1;
		j++;
	}
	if ($('#resultsDiv td').first() != null){
		$('#resultsDiv td').first().click();
	}
}

function generateResultsView() {
	// create the UI for all the movie results in this page number
	let resultsCurrentPage = responseList[this.innerHTML - 1];
	$('#resultsDiv .listUI').empty();
	for(let i = 0; i < resultsCurrentPage.length; i++) {
		$('#resultsDiv .listUI').append(generateResultsMovie(resultsCurrentPage[i]));
	}
}

function generateResultsMovie(ithResult) {
	let imdbID = ithResult["imdbID"];
	let $cell = $('<div>', {'class': 'singleMovie', 'imdbID': `${imdbID}`});
	// add movie's main image div
	$cell.append(`<img src=${ithResult["Poster"]} onerror=this.src='${NO_IMAGE}'; width="150">`);
	// add movie's main info div
	let $infoDiv = $('<div>', {'class': 'singleMovieInfo'});
	$infoDiv.append(`<h4>${ithResult["Title"]}</h4>`);
	$infoDiv.append(`<p>Year: ${ithResult["Year"]}</p>`);
	$infoDiv.append(`<p>Type: ${ithResult["Type"]}</p>`);
	if (nominatedMovies.has(imdbID)) { 
		$infoDiv.append(createRemoveButton(imdbID));
	} else {
		$infoDiv.append(createNominateButton(imdbID));
	}
	$cell.append($infoDiv);
	$cell.append(`<br>`);
	return $cell;
}

function createRemoveButton(imdbID) {
	let $removeButton = $('<button>', {'type': 'button'});
	$removeButton.html('Remove');
	$removeButton.click(function(e){
		removeMovie(imdbID);
	});
	return $removeButton;
}

function createNominateButton(imdbID){
	let $nominateButton = $('<button>', {'type': 'button'});
	$nominateButton.html('Nominate');
	$nominateButton.click(function(e){
		nominateMovie(imdbID);
	});
	return $nominateButton;
}

function removeMovie(imdbID) {
	let removeButton = $(`#resultsDiv div[imdbid=${imdbID}] button`);
	if (removeButton[0] != undefined) {
		removeButton.replaceWith(createNominateButton(imdbID));
	}
	$(`#nominations div[imdbid=${imdbID}]`).remove();
	nominatedMovies.delete(imdbID);
}

function nominateMovie(imdbID) {
	if (nominatedMovies.size >= NOMINATION_LIMIT) {
		//TODO: https://www.w3schools.com/howto/howto_js_alert.asp
		confirm(`Maximum of ${NOMINATION_LIMIT} allowed.\nTry removing some nominations first.`);
		return;
	}
	$(`#resultsDiv div[imdbid=${imdbID}] button`).replaceWith(createRemoveButton(imdbID));
	$(`#resultsDiv div[imdbid=${imdbID}]`).clone().appendTo('#nominations .listUI');
	$(`#nominations div[imdbid=${imdbID}] button`).replaceWith(createRemoveButton(imdbID));
	nominatedMovies.add(imdbID);
}
