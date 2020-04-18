// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
'use strict';
 
const functions = require('firebase-functions');
const {WebhookClient} = require('dialogflow-fulfillment');
const {Card, Suggestion} = require('dialogflow-fulfillment');
const {dialogflow} = require('actions-on-google');
const app = dialogflow({debug:true});
process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements
 
exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
 
  function welcome(agent) {
    agent.add(`Welcome to my agent!`);
  }
 
  function fallback(agent) {
    agent.add(`I didn't understand`);
    agent.add(`I'm sorry, can you try again?`);
  }

  var nDecks = 1;
  function getDecks(agent) {
  	nDecks = agent.parameters.nDecks;
    agent.add("Okay, Let's play with " + nDecks.toString());
    start_game();
  }
  
  function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

  var SUIT;
  var DECK;
  var myDeck = [];
  
  var Dealer=0,Player=0;
  function initialiseGame(){
  	SUIT = [1,2,3,4,5,6,7,8,9,10,10,10,10];
	DECK = SUIT.concat(SUIT.concat(SUIT.concat(SUIT)));
    var loopVar;
  	for (loopVar = 0; loopVar < nDecks ; ++loopVar){
  		myDeck = myDeck.concat(DECK);
  	}
    myDeck = shuffle(myDeck);
    Dealer = getCard();
    Player = getCard()+getCard();
    //agent.add("Okay!, Here we go!");
  }
  
  function getCard(){
  	var thisCard = myDeck.pop();
    return thisCard;
  }
  
  function start_game(){
    var send_str = "Place your bets! Let me teach you how to play. Say \"Hit\" if you want another card, and \"Stand\" to stay at this hand. Let me shuffle the deck." + "You have "+Player.toString()+" in your hand, and the Dealer has "+Dealer.toString()+". What do you want to do?" ;
    initialiseGame();
    agent.add(send_str);
  }
  var win;
  function hit(agent){
    var presentCard = getCard();
//Response time too long
 //method doesn't work : MalformedResponse
//Failed to parse Dialogflow response into AppResponse because of invalid platform response: Could not find a RichResponse or SystemIntent in the platform response for agentId: cdc1c904-5197-4e7d-8c68-3ceb67aa6600 and intentId: b6240d80-0773-443b-87e7-ad48e4fd1856. WebhookStatus: code: 14 message: "Webhook call failed. Error: UNAVAILABLE." ..
    if(Player <= 21){
    	Player = Player + presentCard;
    }
    agent.add("You got a "+presentCard.toString()+". You have "+Player.toString()+" in your hand now. What do you want to do?");
  }
  
  function stand(){
    Dealer = Dealer + getCard();
    while (Dealer <= 17){
    Dealer = Dealer + getCard();
    }
    if(Dealer > 21 || Player > Dealer){
    agent.add("You win!");
    }
    else {
    	agent.add("You lose! Tough luck mate.");
    }
  }
  // // Uncomment and edit to make your own intent handler
  // // uncomment `intentMap.set('your intent name here', yourFunctionHandler);`
  // // below to get this function to be run when a Dialogflow intent is matched
  // function yourFunctionHandler(agent) {
  //   agent.add(`This message is from Dialogflow's Cloud Functions for Firebase editor!`);
  //   agent.add(new Card({
  //       title: `Title: this is a card title`,
  //       imageUrl: 'https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png',
  //       text: `This is the body text of a card.  You can even use line\n  breaks and emoji! 💁`,
  //       buttonText: 'This is a button',
  //       buttonUrl: 'https://assistant.google.com/'
  //     })
  //   );
  //   agent.add(new Suggestion(`Quick Reply`));
  //   agent.add(new Suggestion(`Suggestion`));
  //   agent.setContext({ name: 'weather', lifespan: 2, parameters: { city: 'Rome' }});
  // }

  // // Uncomment and edit to make your own Google Assistant intent handler
  // // uncomment `intentMap.set('your intent name here', googleAssistantHandler);`
  // // below to get this function to be run when a Dialogflow intent is matched
  // function googleAssistantHandler(agent) {
  //   let conv = agent.conv(); // Get Actions on Google library conv instance
  //   conv.ask('Hello from the Actions on Google client library!') // Use Actions on Google library
  //   agent.add(conv); // Add Actions on Google library responses to your agent's response
  // }
  // // See https://github.com/dialogflow/fulfillment-actions-library-nodejs
  // // for a complete Dialogflow fulfillment library Actions on Google client library v2 integration sample

  // Run the proper function handler based on the matched Dialogflow intent name
  let intentMap = new Map();
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
  intentMap.set('Get Decks', getDecks);
  //intentMap.set('Start Game', start_game);
  intentMap.set('Hit', hit);
  intentMap.set('Stand', stand);
  // intentMap.set('your intent name here', yourFunctionHandler);
  // intentMap.set('your intent name here', googleAssistantHandler);
  agent.handleRequest(intentMap);
});
