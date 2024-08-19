import express from "express"
import bodyParser from "body-parser"
import {fileURLToPath} from "url"
import {dirname} from "path"
import fs from "fs"
import axios from "axios"
import { addAbortSignal } from "stream"
import config from "./config.js" 

const API_KEY = config._superHeroAPIKey;
const __dirname = dirname(fileURLToPath(import.meta.url));
const currentCharactersInLib = 731;
const standardHandSize = 1;
const app = express();
const superheroAPIAddress = "https://superheroapi.com/api/" + API_KEY + "/"
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
const port = 3000;

/*To do:
Opting for single player experience, as multiplayer at the moment would be too out of scope for a small project like this, will come back later when I have a firmer grasp of things to implement multiplayer
Give functionality to listen for stat choice submission
Give functionality to check win/lose conditions
Give fucntionality to change the state of the screen
Keep in mind scalability and expansion (Do not hard code numbers and states, keep things fluid and lego-blocks-like)
*/
async function retrieveHand(p1cards, p2cards){
    try{
    //pushes card data into p1cards and p2 cards, must be arrays for function to work correctly
     //retrieves amount of card data up to standard hand size and stores it in cardsHand
        for (let i=0; i<=standardHandSize-1; i++){
            //retrieves a random character from the available library of characters
            let card1 = await axios.get(superheroAPIAddress + Math.ceil(Math.random()*currentCharactersInLib));
            let card2 = await axios.get(superheroAPIAddress + Math.ceil(Math.random()*currentCharactersInLib));
            for(const stats in card1.data.powerstats){
                if (card1.data.powerstats[stats] === 'null'){
                    card1.data.powerstats[stats] = 0
                }
            }
            for(const prop in card2.data.powerstats){
                if (card2.data.powerstats[prop] === 'null'){
                    card2.data.powerstats[prop] = 0
                }
            }
            p1cards.push(card1.data);
            p2cards.push(card2.data);
        }
    }catch(error){
        console.log(error);
        return error;
    }
    
}

app.get("/", async (req, res) =>{
    try{
        //initializes hand
        res.render("index.ejs", {
            gameState: "playGame"
        });
    }catch(error){
        console.log(error.data)
    }
});
app.get("/cardsPlz",async(req, res)=>{
    let p1DeckInfo = [];
    let p2DeckInfo = [];
    await retrieveHand(p1DeckInfo,p2DeckInfo);
    let gameDeckInfo = {p1Deck : p1DeckInfo, p2Deck : p2DeckInfo};
    console.log(gameDeckInfo);
    res.json(gameDeckInfo);
});

app.listen(port, ()=>{
    console.log(`Server is listening on port: ` + port);
});