var cursong=-1;
var prevsong;

function loadData() {
    playerNames.clear();
    $("#slPlayerList > option").remove();
    $("#slTableContainer").show();
    $("#slTable").show();
    $("#slScoreboard").show();
    $("#slInfo").show();
    clearInfo();
    clearScoreboard();
    $("tr.songData").remove();
    let songid=0;
    for (let song of importData) {
        let guesses = song.players.filter((tmpPlayer) => tmpPlayer.correct === true);
        let guessesCount=guesses.length;
        if(song.correctCount) guessesCount=song.correctCount;
        $("#slTable").append($("<tr id="+songid+"></tr>")
            .addClass("songData")
            .addClass("clickable")
            .append($("<td></td>")
                .text(song.songNumber)
                .addClass("songNumber")
            )
            .append($("<td></td>")
                .text(song.name)
                .addClass("songName")
            )
            .append($("<td></td>")
                .text(song.artist)
                .addClass("songArtist")
            )
            .append($("<td></td>")
                .text(song.anime.romaji)
                .addClass("animeNameRomaji")
            )
            .append($("<td></td>")
                .text(song.anime.english)
                .addClass("animeNameEnglish")
            )
            .append($("<td></td>")
                .text(song.type)
                .addClass("songType")
            )
            .append($("<td></td>")
                .text("...")
                .addClass("playerAnswer")
            )
            .append($("<td></td>")
                .text(guessesCount + "/" + song.activePlayers + " (" + parseFloat((guessesCount/song.activePlayers*100).toFixed(2)) + "%)")
                .addClass("guessesCounter")
            )
            .append($("<td></td>")
                .text(formatSamplePoint(song.startSample, song.videoLength))
                .addClass("samplePoint")
            )
            .click(function () {
                if (!$(this).hasClass("selected")) {
                    $(".selected").removeClass("selected");
                    $(this).addClass("selected");
                    updateScoreboard(song);
                    updateInfo(song);
                    repeat=repeatcount=$("#slRepeat").val()*1;
                    repeatcount--;
                }
                else {
                    $(".selected").removeClass("selected");
                    clearScoreboard();
                    clearInfo();
                    stopsong();
                }
            })
            .hover(function () {
                $(this).addClass("hover");
            }, function () {
                $(this).removeClass("hover")
            })

        );
        if ($("#slAnimeTitleSelect").val() === "english") {
            $(".animeNameEnglish").show();
            $(".animeNameRomaji").hide();
        }
        else {
            $(".animeNameEnglish").hide();
            $(".animeNameRomaji").show();
        }
        song.players.forEach((player) => {
            playerNames.add(player.name);
        });
        song.songid=songid;
        songid++;
    }
    playerNames.forEach((p1, p2) => {
        $("#slPlayerList").append($("<option></option>")
            .attr("value", p1)
        );
    });
    $(".playerAnswer").hide();
    updateTableGuesses($("#slPlayerName").val());
    updateScoreboardHighlight($("#slPlayerName").val());
}

function formatSamplePoint(start, length) {
    if (isNaN(start) || isNaN(length)) {
        return "Video not loaded";
    }
    let startPoint = Math.floor(start / 60) + ":" + (start % 60 < 10 ? "0" + (start % 60) : start % 60);
    let videoLength = Math.round(length);
    let totalLength = Math.floor(videoLength / 60) + ":" + (videoLength % 60 < 10 ? "0" + (videoLength % 60) : videoLength % 60);
    return startPoint + "/" + totalLength;
}

function updateTableGuesses(playerName) {
    let playerExists = false;
    for (let i = 0; i < importData.length; i++) {
        let findPlayer = importData[i].players.find((player) => {
            return player.name === playerName;
        });
        if (findPlayer !== undefined) {
            playerExists = true;
            $($(".songData .playerAnswer").get(i)).text(findPlayer.answer);
            $(".playerAnswer").show();

            if (findPlayer.active === true) {
                $($("tr.songData").get(i)).addClass(findPlayer.correct === true ? "rightAnswerTable" : "wrongAnswerTable");
            }
            else {
                $($("tr.songData").get(i)).removeClass("rightAnswerTable");
                $($("tr.songData").get(i)).removeClass("wrongAnswerTable");
            }
        }
        else {
            $($("tr.songData").get(i)).removeClass("rightAnswerTable");
            $($("tr.songData").get(i)).removeClass("wrongAnswerTable");
            $($(".songData .playerAnswer").get(i)).text("...");
            if (!playerExists) {
                $(".playerAnswer").hide();
            }
        }

    }
}

function updateScoreboard(song) {
    $(".slScoreboardEntry").remove();
    song.players.sort((a, b) => a.positionSlot - b.positionSlot).forEach((player) => {
        $("#slScoreboardContainer").append($("<div></div>")
            .addClass("slScoreboardEntry")
            .addClass(player.active === false ? "disabled" : "")
            .append($("<span></span>")
                .addClass("slScoreboardPosition")
                .text(player.position)
                .width(player.position.toString().length === 3 ? "42px" : "")
                .css("text-align", player.position.toString().length === 3 ? "left" : "center")
            )
            .append($("<p></p>")
                .append($("<b></b>")
                    .addClass("slScoreboardScore")
                    .addClass(player.correct === true ? "rightAnswerScoreboard" : "")
                    .text(player.score)
                )
                .append($("<span></span>")
                    .addClass("slScoreboardCorrectGuesses")
                    .addClass((song.gameMode !== "Standard" && song.gameMode !== "Ranked") ? "" : "hide")
                    .text(player.correctGuesses)
                )
                .append($("<span></span>")
                    .addClass("slScoreboardName")
                    .text(player.name)
                    .addClass($("#slPlayerName").val() === player.name ? "self" : "")
                )
            )
        )
    });
}

function updateScoreboardHighlight(name) {
    $(".slScoreboardEntry").each((index, elem) => {
        if ($(elem).find(".slScoreboardName").text() === name) {
            $(elem).find(".slScoreboardName").addClass("self");
        }
        else {
            $(elem).find(".slScoreboardName").removeClass("self");
        }
    });
}

function updateInfo(song) {
	var cursongdata=song;
	cursong=song.songid;
	$("#slInfoHeader").children().remove();
	if($("#slPlayOrder").val() === "random") {
		$("#slInfoHeader").append("<h2>Previous Song Info</h2>");
		if(prevsong!==undefined) song=importData[prevsong];
		else song=undefined;
	    prevsong=cursong;

	}
	else {
		$("#slInfoHeader").append("<h2>Song Info</h2>");
		prevsong=undefined;
	}
	stopsong();
    clearInfo();
    if(song!==undefined) {
	    let infoRow1 = $("<div></div>")
	        .attr("class", "slInfoRow");
	    let infoRow2 = $("<div></div>")
	        .attr("class", "slInfoRow");
	    let infoRow3 = $("<div></div>")
	        .attr("class", "slInfoRow");
	    let infoRow4 = $("<div></div>")
	        .attr("class", "slInfoRow");
	    
	    let guesses = song.players.filter((tmpPlayer) => tmpPlayer.correct === true);
        let guessesCount=guesses.length;
        if(song.correctCount) guessesCount=song.correctCount;

	    let infoSongName = $("<div></div>")
	        .attr("id", "slInfoSongName")
	        .html("<h5><b>Song Name</b></h5><p>" + song.name + "</p>");
	    let infoArtist = $("<div></div>")
	        .attr("id", "slInfoArtist")
	        .html("<h5><b>Artist</b></h5><p>" + song.artist + "</p>");
	    let infoAnimeEnglish = $("<div></div>")
	        .attr("id", "slInfoAnimeEnglish")
	        .html("<h5><b>Anime English</b></h5><p>" + song.anime.english + "</p>");
	    let infoAnimeRomaji = $("<div></div>")
	        .attr("id", "slInfoAnimeRomaji")
	        .html("<h5><b>Anime Romaji</b></h5><p>" + song.anime.romaji + "</p>");
	    let infoType = $("<div></div>")
	        .attr("id", "slInfoType")
	        .html("<h5><b>Type</b></h5><p>" + song.type + "</p>");
	    let infoSample = $("<div></div>")
	        .attr("id", "slInfoSample")
	        .html("<h5><b>Sample Point</b></h5><p>" + formatSamplePoint(song.startSample, song.videoLength) + "</p>");
	    let infoGuessed = $("<div></div>")
	        .attr("id", "slInfoGuessed")
	        .html("<h5><b>Guessed<br>" + guessesCount + "/" + song.activePlayers + " (" + parseFloat((guessesCount/song.activePlayers*100).toFixed(2)) + "%)</b></h5>");
	    let infoFromList = $("<div></div>")
	        .attr("id", "slInfoFromList")
	        .html("<h5><b>From Lists<br>" + song.fromList.length + "/" + song.totalPlayers + " (" + parseFloat((song.fromList.length/song.totalPlayers*100).toFixed(2)) + "%)</b></h5>");
	    let infoUrls = $("<div></div>")
	        .attr("id", "slInfoUrls")
	        .html("<h5><b>URLs</b></h5>");

	    infoRow1.append(infoSongName);
	    infoRow1.append(infoArtist);
	    infoRow1.append(infoType);

	    infoRow2.append(infoAnimeEnglish);
	    infoRow2.append(infoAnimeRomaji);
	    infoRow2.append(infoSample);

	    infoRow3.append(infoUrls);

	    infoRow4.append(infoGuessed);
	    infoRow4.append(infoFromList);

	    let infoListContainer;
	    if (song.fromList.length === 0) {
	        infoGuessed.css("width", "98%");
	        infoFromList.hide();
	        if (guesses.length > 1) {
	            let infoGuessedLeft = $("<ul></ul>")
	                .attr("id", "slInfoGuessedLeft");
	            let infoGuessedRight = $("<ul></ul>")
	                .attr("id", "slInfoGuessedRight");
	            let i = 0;
	            for (let guessed of guesses) {
	                if (i++ % 2 === 0) {
	                    infoGuessedLeft.append($("<li></li>")
	                        .text(guessed.name + " (" + guessed.score + ")")
	                    );
	                }
	                else {
	                    infoGuessedRight.append($("<li></li>")
	                        .text(guessed.name + " (" + guessed.score + ")")
	                    );
	                }
	            }
	            infoGuessed.append(infoGuessedLeft);
	            infoGuessed.append(infoGuessedRight);
	        }
	        else {
	            infoListContainer = $("<ul></ul>")
	                .attr("id", "slInfoGuessedList");
	            for (let guessed of guesses) {
	                infoListContainer.append($("<li></li>")
	                    .text(guessed.name + " (" + guessed.score + ")")
	                );
	            }
	            infoGuessed.append(infoListContainer);
	        }
	    }
	    else {
	        infoGuessed.css("width", "");
	        infoListContainer = $("<ul></ul>")
	            .attr("id", "slInfoGuessedList");
	        infoFromList.show();
	        for (let guessed of guesses) {
	            infoListContainer.append($("<li></li>")
	                .text(guessed.name + " (" + guessed.score + ")")
	            );
	        }
	        infoGuessed.append(infoListContainer);
	    }
	    let listStatus = {
	        1: "Watching",
	        2: "Completed",
	        3: "On-Hold",
	        4: "Dropped",
	        5: "Plan to Watch",
	        6: "Looted"
	    };

	    infoListContainer = $("<ul></ul>");
	    for (let fromList of song.fromList) {
	        infoListContainer.append($("<li></li>")
	            .text(fromList.name + " (" + listStatus[fromList.listStatus] + ((fromList.score !== null) ? ", " + fromList.score + ")" : ")"))
	        );
	    }
	    infoFromList.append(infoListContainer);

	    infoListContainer = $("<ul></ul>");
	    for (let host in song.urls) {
	        for (let resolution in song.urls[host]) {
	            let url = song.urls[host][resolution];
	            let innerHTML = "";
	            innerHTML += (host === "catbox" ? "Catbox " : (host === "animethemes" ? "AnimeThemes " : "OpeningsMoe "));
	            innerHTML += (resolution === "0") ? "MP3: " : (resolution === "480") ? "480p: " : "720p: ";
	            innerHTML += "<a href=\"" + url + "\" target=\"_blank\">" + url + "</a>";
	            infoListContainer.append($("<li></li>")
	                .html(innerHTML)
	            );
	        }
	    }
	    infoUrls.append(infoListContainer);

	    $("#slInfoBody").append(infoRow1);
	    $("#slInfoBody").append(infoRow2);
	    $("#slInfoBody").append(infoRow3);
	    $("#slInfoBody").append(infoRow4);
	}
    song=cursongdata;

	var length= parseInt($("#slLength").val());

	let reslist=["0","480","720"];
	let hostlist=["catbox","animethemes","openingsmoe"]
	if (autoplay) {
		for(let res of reslist) {
			for(let host of hostlist) {
				if(song.urls[host]!==undefined) {
					if(song.urls[host][res]!==undefined) {
						var starttime=0;
						if($("#slSample").val() === "random") starttime = Math.random()*(song.videoLength-length-5);
						else if($("#slSample").val() === "start") starttime = .2;
						else if($("#slSample").val() === "mid") starttime = (song.videoLength-length)*.5;
						else if($("#slSample").val() === "end") starttime = song.videoLength-length-5;
						else if($("#slSample").val() === "recorded") starttime = song.startSample;
						if(starttime<0) starttime=0;
						play(song.urls[host][res],starttime);
						return;
					}
				}
			}
		}
	}
}
var nextsongtimer=null;

function clearInfo() {
    $("#slInfoBody").children().remove();
}

function clearScoreboard() {
    $(".slScoreboardEntry").remove();
}

function play(song, starttime) {
    var videoPlayer = document.getElementById('videoPlayer');
    videoPlayer.src = song;
    videoPlayer.currentTime=starttime;
    videoPlayer.play();
}

let repeat=0;
var repeatcount=0;
function playnextsong() {
	repeat=$("#slRepeat").val()*1;
	var nextindex;
	if(repeat>0 && repeatcount>0) {
		var index=playlist.findIndex((x)=>x==cursong);
		nextindex=playlist[index];
	}
	else if($("#slPlayOrder").val() === "random") {
		nextindex=playlist[getRandomInt(playlist.length)];
		if(repeat>0) repeatcount=repeat;
	}
	else {
		var index=playlist.findIndex((x)=>x==cursong);
		if(index<playlist.length-1) index++; else index=0;
		nextindex=playlist[index];
		if(repeat>0) repeatcount=repeat;
	}
	if(repeat>0) repeatcount--;
	playsong(nextindex);
}
function stopsong() {
    var videoPlayer = document.getElementById('videoPlayer');
    videoPlayer.pause();
    if(nextsongtimer!=null) clearTimeout(nextsongtimer);
    nextsongtimer=null;
}

function playsong(index) {
	$(".selected").removeClass("selected");
	$($("tr.songData").get(index)).addClass("selected");
	$("#slTableBody").scrollTop($(".songData.selected").position().top);
	updateScoreboard(importData[index]);
	updateInfo(importData[index]);
}
function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}
