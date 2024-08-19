let gameState = "mainMen";
let playState = "rps";
let deckP1 = [];
const url = '/cardsPlz'
const playRes = ['computer', 'player', 'draw'];

/*
For the sake of my sanity the computer is int 0 and the player is int 1 and a draw is 2 when referencing winners.
playState can be between one of two states: cardPlay or rps
*/
async function retrieveDecks(url){
    try{
        const response = await fetch(url);
        const data = await response.json();
        const decks = {playerDeck : data.p1Deck, compDeck : data.p2Deck};
        return decks;
    }catch(error){
        console.log(`Retrieving decks has failed with error: \n${error}`)
        return error;
    }
}
//simple function to remove or move items in an array, will think of a cleaner solution later.
function manipulateDeckItem(manipType, deck, fromPos, toPos){
    let res = [];
    if(manipType == 'move'){
        deck.splice(toPos, 0, deck.splice(fromPos, 1)[0]);
    }else if(manipType == 'remove'){
        res = deck.splice(fromPos,1);
        return res[0];
    }else{
        console.log("Mainpulation type required for manipulateDeckItem function, choose either 'move' or 'remove'.");
    }
}

function compPlayerChoice(playState,currentCard){
    if(playState == "rps"){
        let compRpsChoice = Math.ceil(Math.random()*3);
        return compRpsChoice;
    }else if(playState == "cardPlay"){
        console.log(currentCard);
        //implemented to have the computer choose between a random stat or its highest stat at random
        let randMod = Math.ceil(Math.random()*2);
        let compStatChoice
        if(randMod == 1){
            compStatChoice = Object.entries(currentCard.powerstats).sort(function(a, b) {
            return b[1] - a[1];
          })[0][0];
        }else{
            let randNum = Math.floor(Math.random()*Object.keys(currentCard.powerstats).length);
            compStatChoice = Object.keys(currentCard.powerstats)[randNum];
            console.log(randNum);
            console.log(compStatChoice);
        }
          return compStatChoice;
    }
}
//takes player option and comp option as a number between 1 and 3 and outputs a rock paper scissors winner
async function rps(compChoice, playerChoice){
    try{
        let options = ['rock','paper','scissors'];
        let winner = 0;
        let players = ['player', 'computer'];
        let resultMessage = '';
        let resultChoice = `Computer chose ${options[compChoice-1]}, player chose ${options[playerChoice-1]}`;
        if((compChoice == 0 && playerChoice == 1) || (compChoice == 1 && playerChoice == 2) || (compChoice == 2 && playerChoice == 0)){
            resultMessage = 'The player wins, you may choose a stat to battle with!';
            winner = 1;
        }else if (playerChoice === compChoice){
            winner = players[Math.floor(Math.random()*players.length)];
            resultMessage = `A draw was detected, winner randomly selected to be: ${winner}.`
        }else{
            winner = 0;
            resultMessage = 'Computer wins, computer will now select the competing stat!'
        }
        let results = {resWinner : winner, resMessage : resultMessage, resChoices : resultChoice};
        //results returned are to give a full breakdown of battle to make things more interesting in the frontend
        return results;
    }catch(error){
        console.log(`Won't lie, I don't know how rock, paper scissors failed but here we are: \n${error}`);
    }
}
//basic battle function comparing the two stat choices
async function cardBattle(statChoice, compCard, playerCard){
    try{
        let compStat = compCard.powerstats[statChoice];
        let playerStat = playerCard.powerstats[statChoice];
        let results = {winner: 0, winMessage: ''};
        //compares two stats and returns results
        if(compStat>playerStat){
            results.winner = 0;
            results.winMessage = `${playerCard.name} has battled ${compCard.name} in a battle of ${statChoice} and lost!`;
        }else if(compStat == playerStat){
            results.winner = 2;
            results.winMessage = `${playerCard.name} has battled ${compCard.name} in a battle of ${statChoice} and is evenly matched, their mutual demise is guarenteed!`;
        }else{
            results.winner = 1;
            results.winMessage = `${playerCard.name} has battled ${compCard.name} in a battle of ${statChoice} and won!`;
        }
        return results;
    }catch(error){
        console.log(`An error has occurred during stat battle: \n${error}`);
    }
}
async function playGameMain(url, gameState){
    try{
        console.log("Retrieving decks.")
        let decks = await retrieveDecks(url);
        console.log(`Decks retrieved. Initilizing decks`)
        //declaring all these variables now so I don't re-declare them repeatedly in the while loop
        console.log(decks);
        let playersDeck = decks.playerDeck;
        let computersDeck = decks.compDeck;
        let compRpsChoice = '';
        let rpsRes = '';
        let compCurrentCard = '';
        let playerCurrentCard = '';
        let battleRes = '';
        let winner = '';
        //runs the game loop while player or computer has one card in their deck
        while(!(playersDeck.length === 0) && !(computersDeck.length === 0) && !(typeof computersDeck[0] == 'undefined') && !(typeof playersDeck[0] == 'undefined')){
            playState = 'rps';
            console.log(computersDeck);
            console.log(playersDeck);
            compRpsChoice = compPlayerChoice(playState);
            rpsRes = await rps(compRpsChoice,2);//placeholder values for testing, will need to create javascript that creates an interface for button input and pop ups to put player values into play
            console.log(rpsRes.resMessage);
            //assigns the current playable card to each player
            compCurrentCard = computersDeck[0];
            playerCurrentCard = playersDeck[0];
            displayCard(playRes[0], compCurrentCard);
            displayCard(playRes[1], playerCurrentCard);
            //console.log(`Player card: ${playerCurrentCard}\nComputer Card: ${compCurrentCard}`);//for debugging
            playState = 'cardPlay'
            if(rpsRes.resWinner === 0){
                let compStatChoice = compPlayerChoice(playState, compCurrentCard);//this declaration is an acception because idk, gonna see if it breaks shit later down the line
                //add a status update to inform the player that the computer has chosen a stat.
                battleRes = await cardBattle(compStatChoice, compCurrentCard, playerCurrentCard);
                console.log(battleRes);
            }else{
                let compStatChoice = compPlayerChoice(playState, playerCurrentCard);
                battleRes = await cardBattle(compStatChoice, compCurrentCard, playerCurrentCard);
                console.log(battleRes);
            }
            let winnings = {};
            switch(battleRes.winner){
            case 0:
                winnings = manipulateDeckItem('remove',playersDeck,0);
                computersDeck.push(winnings);
                winner = playRes[0];
                console.log(`${playRes[battleRes.winner]} wins! ${playRes[1]}'s card transfered to ${playRes[battleRes.winner]}'s deck`);
                break;
            case 1:
                winnings = manipulateDeckItem('remove',computersDeck,0);
                playersDeck.push(winnings);
                winner = playRes[1];
                console.log(`${playRes[battleRes.winner]} wins! ${playRes[0]}'s card transfered to ${playRes[battleRes.winner]}'s deck`);
                break;
            case 2:
                manipulateDeckItem('remove',computersDeck,0);
                manipulateDeckItem('remove',playersDeck,0);
                winner = playRes[2];
                console.log(`It's a draw! Both cards are destroyed!`);
                break;
            default:
                console.log("Unexpected error ocurred, winner int out of range.");
                break;
            }
            //Moves to new card for both decks at the end of the round.
            if(!(playersDeck.length === 1)){
             manipulateDeckItem('move',playersDeck,0,playersDeck.length - 1);
            }
            if(!(computersDeck.length === 1)){
                manipulateDeckItem('move',computersDeck,0,computersDeck.length - 1)
            }
            console.log(`Players deck size: ${playersDeck.length}\nComputers Deck size: ${computersDeck.length}`);
        }
        console.log(`And the winner is...${winner}!`);
    }catch(error){
        console.log(`An error has occurred during game process: \n${error}`);
    }
}