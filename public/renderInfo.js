//does what it says on the box, renders the card information into the html cards, player specifies the player {player or computer}
function displayCard(player, cardInfo){
    let heroAttr = Object.entries(cardInfo.powerstats);
    for(let attr in heroAttr){
        let upperCaseLetter = heroAttr[attr][0].slice(0,1).toUpperCase();
        let restOfWord = heroAttr[attr][0].slice(1,heroAttr[attr][0].length);
        heroAttr[attr][0] = upperCaseLetter + restOfWord;
    }
    let statData = ejs.render(`<%for(let attr in attributes){%><li><%=attributes[attr][0]%>: <%=attributes[attr][1]%></li><%}%>`,{attributes: heroAttr});
    $(`#${player}-card-img`).attr('src', cardInfo.image.url);
    $(`#${player}-card-title`).html(cardInfo.name);
    $(`#${player}-card-attr`).html(statData);
}