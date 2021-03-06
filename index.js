var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var CronJob = require('cron').CronJob;
var waterfall = require('async-waterfall');
var app = express();
var USER_ACCESS_TOKEN = 'EAAXfWnTnzU4BAFICZA8UPzphm0gGM9uha4MozdhIQOtJhbgWeVKyEt9nUpf1LTtqwgQe3dLncGUbtjye9ftmUM8Yhq2f1R1GrGYeCOwhw0B0LAH5gw4lSZAkcVU4ADhqr1BZCDelVeIuj1xxJhMvlfjY2Xyv5RZCIzGiTYa80wZDZD';
       // Amarujala News EAALlQ2OEzrUBAA3G8FHOcqmRXiD9dMpulEeaozEoNhqw7uNoitrZCcIGNVGj1r3ZCWlxLmiUbdLbsZAMW6t0Ue74ifGtWosb0WtzIkbZCs4LG01zmtLBvxv27SxnGyN6fIAVGpTS0jTyCnAiZCLshE12sGu3JJVGOye7eH3IIgwZDZD

var MongoClient = require('mongodb').MongoClient;
var mongo_db;
var url = 'mongodb://127.0.0.1/testbot';
MongoClient.connect(url, function(err, db) {
  console.log("Connected to server correctly.");
  mongo_db = db;
});
var jsonobj = [];

var ObjectId = require('mongodb').ObjectID;



app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
// app.use(express.static('/'));
app.listen(3333);





app.get('/assets/:id', function(req, res){
    var path = __dirname+"/assets/"+req.params.id;
    res.sendFile(path);
});





// Server frontpage
app.get('/', function (req, res) {
    res.send('This is TestBot Server2');
});





// Facebook Webhook
app.get('/webhook', function(req, res) {


    // console.log("webhook get");
  if (req.query['hub.mode'] === 'subscribe' &&
      req.query['hub.verify_token'] === 'amarujala_fbchatbot_token') {
    console.log("Validating webhook");
    res.status(200).send(req.query['hub.challenge']);
  //res.send("Holaa");
  } else {
    console.error("Failed validation. Make sure the validation tokens match.");
    res.sendStatus(403);    
  }  
});





// handler receiving messages
app.post('/webhook', function (req, res) {

    // console.log("webhook post");
    var events = req.body.entry[0].messaging;
    for (i = 0; i < events.length; i++) {
        var event = events[i];
        if (event.message && event.message.text) {
            // console.log(event.message.text);
            if (!validMessage(event.sender.id, event.message.text))
                {   
                    // console.log("76");
                 search_by_tag(event.sender.id, event.message.text);
            }
    }
    else if (event.postback) {
            
             // console.log("postback received");
            // console.log(event.postback['payload']);

            if(event.postback['payload'] === "Latest Headlines")
                latest_stories(event.sender.id);

            if(event.postback['payload'] === "Popular News")
                popular_news(event.sender.id);

            if(event.postback['payload'] === "Subscriptions")
                show_subscriptions(event.sender.id);

            else
                {   
                    // console.log("This is 80");
                    // console.log(event.postback['payload']);
                validMessage(event.sender.id, event.postback['payload']);
            }

            insert_db(event.sender.id, event.postback);
           
    }
    
    }
    res.sendStatus(200);
});











//Get Started Button
request({
        url: 'https://graph.facebook.com/v2.6/me/thread_settings',
        qs: {access_token: USER_ACCESS_TOKEN},
        //qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
        //qs: {fields: "first_name,last_name,profile_pic,locale,timezone,gender",access_token: "EAALlQ2OEzrUBAPtETHrpvZBWiP3vbxobRtrGEfHuuTFmQZCOPt3OK1DqzvlyZBeNvZC5QbA3eASUvBcJArBNNAoc403PkZBZCA0iD4LmTNzCRvRytpu00rQECZByYdQZAiRIl20ZCRY8dK1wiPBXQPf72SkQtvAx8DXrZBclXnlb4xVgZDZD"},
        method: 'POST',
        json: {
            setting_type: "call_to_actions",
            thread_state: "new_thread",
            call_to_actions: [{
                payload: "Get Started"
            }]
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending message: ', error);
        } else if (!error && response.statusCode == 200) {
            // console.log("121 + "+body);
        }
    });














//Persistent Menu
request({
        url: 'https://graph.facebook.com/v2.6/me/thread_settings',
        qs: {access_token: USER_ACCESS_TOKEN},
        //qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
        //qs: {fields: "first_name,last_name,profile_pic,locale,timezone,gender",access_token: "EAALlQ2OEzrUBAPtETHrpvZBWiP3vbxobRtrGEfHuuTFmQZCOPt3OK1DqzvlyZBeNvZC5QbA3eASUvBcJArBNNAoc403PkZBZCA0iD4LmTNzCRvRytpu00rQECZByYdQZAiRIl20ZCRY8dK1wiPBXQPf72SkQtvAx8DXrZBclXnlb4xVgZDZD"},
        method: 'POST',
        json: {
            setting_type: "call_to_actions",
            thread_state: "existing_thread",
            call_to_actions: [
            {   type: "postback",
                title: "Menu",
                payload: "Menu"
            },
            {
                type: "postback",
                title: "Subscriptions",
                payload: "Subscriptions"
            },
            {
                type: "postback",
                title: "Start Over",
                payload: "Get Started"
            }   
            ]
        }
    }, function(error, response, body) {
        if (error) {
            console.log('172 Error sending message: ', error);
        } else if (!error && response.statusCode == 200) {
            // console.log("174 + "+body);
        }
    });
















//Greeting Text
request({
    url:'https://graph.facebook.com/v2.6/me/thread_settings',
        qs: {access_token: USER_ACCESS_TOKEN},
    method: 'POST',
    json: {
        setting_type: 'greeting',
        greeting:
        {
            text: 'Hi {{user_first_name}}, Welcome to Amarujala News Messenger - A leading media house empowering people by providing unbiased news with courage of conviction, commitment, transparency and creativity.'
        }

    }
    }, function(error, response, body) {
        if (error) {
            console.log('172 Error sending message: ', error);
        } else if (!error && response.statusCode == 200) {
             // console.log("207 + "+body);
        }
    });

















//Bot is typing
request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token: USER_ACCESS_TOKEN},
    method: 'POST',
    json: {
        sender_action: 'typing_on'
    }
},  function(error, response, body) {
    if(error)
        console.log(error);
    // else if(!error && response.statusCode === 200)
        // console.log('Typing on');
}
);













//latest news feeds - every 4 hrs
var job = new CronJob('00 00 8,12,16,20 * * *', function(){
        var pop_coll = mongo_db.collection('popular');
        pop_coll.find({"latest":true},{fb_id:1, _id:0}).toArray(function(err, docs){
            if(err)
                console.log("278 Error");
            else
                {
                    //console.log("daily feeds:"+docs[0]['fb_id']);
                    send_latest_feeds(docs);
                }

            });

    });
job.start();






//popular feeds once only
var pop_job = new CronJob('00 00 21 * * *', function(){
     var pop_coll = mongo_db.collection('popular');
        pop_coll.find({"popular":true},{fb_id:1, _id:0}).toArray(function(err, docs){
            if(err)
                console.log("300 Error");
            else
                {
                    //console.log("daily feeds:"+docs[0]['fb_id']);
                    send_popular_feeds(docs);
                }

            });

});
pop_job.start();










//latest subscribed facebook feeds
function send_latest_feeds(recipientId)
{
    for (var index in recipientId)
    {
        sendMessage(recipientId[index]['fb_id'],{text: "Latest Headlines"});
        latest_stories(recipientId[index]['fb_id']);

    }
}








//popular subscribed facebook feeds
function send_popular_feeds(recipientId)
{
    for (var index in recipientId)
    {
        sendMessage(recipientId[index]['fb_id'],{text: "Today's Most Popular Stories"});
        popular_news(recipientId[index]['fb_id']);

    }
}










//insertion into db
function insert_db(recipientId, message){
    
    if(message['payload'].substring(0,9).toLowerCase() === 'subscribe')
    {


        var tag_to_be_added = message['payload'].substring(10).toLowerCase();
        //console.log("334 + "+ tag_to_be_added);

      
                var pop_coll = mongo_db.collection('popular');



                pop_coll.findOne({"fb_id":recipientId},{_id:1}, function(err, docs){

                    if(err)
                        console.log(err);
                    if(docs){

                            // console.log("_id found");
                            // console.log(docs['_id']);
                            var tag = {};
                            tag[tag_to_be_added] = true;

                            pop_coll.update({'_id':docs['_id']},{$set: tag});

                            waterfall([

                                function(callback){
                                    sendMessage(recipientId, {text: "Subscribed"});
                                    callback(null, 'done');
                                },
                                function(arg1, callback)
                                {

                                if(tag_to_be_added === "latest")
                                    sendMessage(recipientId, {text: "Now you'll be updated every 4 hours. And remember you can type anything, I'll find it out for you..."});
                                else
                                    sendMessage(recipientId, {text: "Now we'll feed you daily, only once. Check out your favorite topics by typing anything, I'll find it for you...."});

                                callback(null, "synchronised messages");
                                }
                                ], function(err, result){

                                if(err)
                                    console.log("391", err);
                                else
                                    console.log(result);

                            });
                           


                                                       
                    }
                    else //this occurs when query returns empty brackets
                    {   
                        get_fb_details(recipientId, tag_to_be_added ,function(callback){


                        pop_coll.insert(
                                        callback, function (err, doc) {
                                            if (err) {
                                        console.log(err);
                                        }
                                        else {
                                        // And forward to success page
                                        console.log("Popular added!!!!!!!!!!!!!!!!!!1");
                                        }

                                    }
                                    );
                           });
                        
                          waterfall([

                                function(callback){
                                    sendMessage(recipientId, {text: "Subscribed"});
                                    callback(null, 'done');
                                },
                                function(arg1, callback)
                                {

                                if(tag_to_be_added === "latest")
                                    sendMessage(recipientId, {text: "Now you'll be updated every 4 hours. And remember you can type anything, I'll find it out for you..."});
                                else
                                    sendMessage(recipientId, {text: "Now we'll feed you daily, only once. Check out your favorite topics by typing anything, I'll find it for you...."});

                                callback(null, "synchronised messages");
                                }
                                ], function(err, result){

                                if(err)
                                    console.log("391", err);
                                else
                                    console.log(result);

                            });
                    }


        });




    }




    if(message['payload'].substring(0,11).toLowerCase() === 'unsubscribe')
        {
            // console.log("reached to unsubscribe");
            var tag_to_be_removed = message['payload'].substring(12).toLowerCase();

            var pop_coll = mongo_db.collection('popular');

            pop_coll.findOne({"fb_id":recipientId}, {"_id": 1}, function(err, docs){
                if(err)
                    console.log(err);
                if (docs)
                {
                    var tag = {};
                    tag[tag_to_be_removed] = true;
                    pop_coll.update({"_id": docs['_id']},{$unset: tag});
                    sendMessage(recipientId, {text: "Unsubscribed"});
                }

            });

        }
}















//api call for fb_details
function get_fb_details(recipientId, tag_to_be_added ,callback)
{
    
    request({
        url: 'https://graph.facebook.com/v2.8/'+recipientId,
        qs: {access_token: USER_ACCESS_TOKEN},
        method: 'GET'
    }, function(error, response, body) {
        if (error) {
            console.log('Error 176 message: ', error);
        }
        else {    

            var res = JSON.parse(body);
            res['fb_id'] = recipientId;

           
            res[tag_to_be_added] = true;
            // console.log(res);

            // delete res_arr['popular'];
           

            callback(res);
        }
    } );



}










function get_first_name(recipientId, callback)
{
    request({
        url: 'https://graph.facebook.com/v2.8/'+recipientId,
        qs: {access_token: USER_ACCESS_TOKEN},
        method: 'GET'
    }, function(error, response, body){
        if(error)
            console.log("Error 474");  
    else
    {
        var res = JSON.parse(body);
        // console.log(res['first_name']);
        callback(res['first_name']);

    }
    });
}













// generic function sending messages
function sendMessage(recipientId, message) {
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        //qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
        qs: {fields: "first_name,last_name,profile_pic,locale,timezone,gender",access_token: USER_ACCESS_TOKEN},
        method: 'POST',
        json: {
            recipient: {id: recipientId},
            message: message,
        }
    }, function(error, response, body) {
        if (error) {
             console.log('Error sending message: ', error);
        } 
    });
};










// send rich message validMessage
function validMessage(recipientId, text) {

    // console.log("validMessage");
    
    text = text || "";
    var values = text.split(' ');

    if (values.length === 1 && values[0].toLowerCase() === 'menu') 
    {

            message = {
                "attachment" : {
                    "type" : "template",
                    "payload": {
                        "template_type": "generic",
                        "elements": [{
                            "title": "\"Most Popular\" News on Amarujala",
                            "image_url": "http://chatbot.amarujala.com/assets/chatbot-popular.jpg",
                            // "image_url": "www.amarujala.com/amp/lucknow/ram-gopal-yadav-says-sp-clash-is-not-going-to-end-now",
                            "buttons": [{
                                "type":"postback",
                                "title": "Show Stories",
                                "payload": "Popular News",
                            }, {
                                "type": "postback",
                                "title": "Subscribe",
                                "payload": "Subscribe Popular",
                                }
                            ]
                        }, {
                            "title": "\"Latest News\" on Amarujala",
                            "image_url": "http://chatbot.amarujala.com/assets/chatbot-latest.jpg",
                            "buttons": [{
                                "type":"postback",
                                "title": "Show Stories",
                                "payload": "Latest Headlines",
                            }, {
                                "type": "postback",
                                "title": "Subscribe",
                                "payload": "Subscribe Latest",
                            }
                            ]
                        }
                        ]

                    }
                }
            }

            sendMessage(recipientId, message);

            return true;
    }







    if (values.length === 1 && values[0].toLowerCase() === 'menu_get_started') 
    {

        waterfall([
            function(callback){
                sendMessage(recipientId,  {text: "We've a main menu where you can find latest and most popular stories" });
                callback(null, 'done');
            },
            function(arg1, callback){
                sendMessage(recipientId,  {text: "You can even access it by typing \"Menu\" " });
                callback(null, 'done');
            },
            function(arg2, callback)
            {
                sendMessage(recipientId,  {text: "You can read the news and subscribe it for daily feeds" })
                callback(null, 'synchronised messages');
            }
            ], function (err, result)
        {
            if(err)
                console.log("633", err);
            else
                console.log(result);
        });
        
        

            message = {
                "attachment" : {
                    "type" : "template",
                    "payload": {
                        "template_type": "generic",
                        "elements": [{
                            "title": "\"Most Popular\" News on Amarujala",
                            "image_url": "http://chatbot.amarujala.com/assets/chatbot-popular.jpg",
                            "buttons": [{
                                "type":"postback",
                                "title": "Show Stories",
                                "payload": "Popular News",
                            }, {
                                "type": "postback",
                                "title": "Subscribe",
                                "payload": "Subscribe Popular",
                                }
                            ]
                        }, {
                            "title": "\"Latest News\" on Amarujala",
                            "image_url": "http://chatbot.amarujala.com/assets/chatbot-latest.jpg",
                            "buttons": [{
                                "type":"postback",
                                "title": "Show Stories",
                                "payload": "Latest Headlines",
                            }, {
                                "type": "postback",
                                "title": "Subscribe",
                                "payload": "Subscribe Latest",
                            }
                            ]
                        }
                        ]

                    }
                }
            }

            sendMessage(recipientId, message);

            return true;
    }
















    if (values.length === 1 && values[0].toLowerCase() === 'about')
    {
        sendMessage(recipientId, {text: "About Chatbot" });
        return true;
    }

    if (values.length === 1 && values[0].toLowerCase() === 'help')
    {
        sendMessage(recipientId, {text: "Help Chatbot" });
        return true;
    } 
    
    if (values.length === 2 && values[0] === 'Get' && values[1] === 'Started')
    {

        get_first_name(recipientId, function(callback) {


        // message2 = {
        //             // "text": "Hi!! Welcome to Amarujala chatbot!! To get a hang of things, try these Latest Stories that we have and subscribe them",
        //                 "attachment" : {
        //                     "type" : "template",
        //                     "payload": {
        //                         "template_type": "button",
        //                         "text": "Hi "+callback+"!! I'm Amarujala News-Bot, here to help you!! You can read news on any topic just by typing here."                                }
                                
                           
        //                 }
        //             }

        sendMessage(recipientId, {text: "Hi "+callback+"!! I'm Amarujala News Messenger, here you can type anything and we'll search it for you."} );



        message = {
            // "text": "Hi!! Welcome to Amarujala chatbot!! To get a hang of things, try these Latest Stories that we have and subscribe them",
                "attachment" : {
                    "type" : "template",
                    "payload": {
                        "template_type": "button",
                        "text": "To get started, tap on Menu for latest and most popular news around the globe and subscribe them to stay connected.",
                            "buttons": [{
                                "type":"postback",
                                "title": "Menu",
                                "payload": "Menu_get_started",
                            }, {
                                "type": "postback",
                                "title": "Subscribe",
                                "payload": "Subscribe Latest",
                                }
                            ]
                        }
                        

                    
                }
            }

        sendMessage(recipientId, message);





        
        });
        return true;

    }   

    return false;
    
};












//latest headlines
function latest_stories (recipientId)
{



    request({
        url: 'http://api.amarujala.com/v1/recentnews/',
        method: 'GET'
    },function(error, response, body){
        if(error)
            console.log("589 erorr");
        else
        {
            var res = JSON.parse(body);

            jsonobj = [];
             for (i=0;i<5;i++)
            {
                jsonobj.push({
                            "title": res['news'][i]['Hindi-Headline'],
                            "subtitle": res['news'][i]['News-Synopsis'],
                            "image_url": res['news'][i]['image'].replace('250x250','500x500'),
                            "default_action": {
                                "type": "web_url",
                                "url": res['news'][i]['Share_URL'].replace('.com/','.com/amp/')
                            },
                            "buttons": [{
                                "type": "web_url",
                                "url": res['news'][i]['Share_URL'].replace('.com/','.com/amp/'),
                                "title": "Quick Brief"

                            },
                            {
                                "type": "web_url",
                                "url": res['news'][i]['Share_URL'],
                                "title": "Full Story"
                            }]
                    });

            }

            message = {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "generic",
                         "elements": jsonobj
                    }
                }
            }

            sendMessage(recipientId, message);

            return true;

        }

    });
}

















//popular news
function popular_news (recipientId)
{


    request({
        url: 'http://api.amarujala.com/v1/tranding-stories',
        method: 'GET'
    },function(error, response, body){
        if(error)
            console.log("695 erorr");
        else
        {
            var res = JSON.parse(body);

            jsonobj = [];
              for (i=0;i<5;i++)
            {
                jsonobj.push({
                            "title": res['news'][i]['Hindi-Headline'],
                            "subtitle": res['news'][i]['News-Synopsis'],
                            "image_url": res['news'][i]['image'].replace('250x250','500x500'),
                            "default_action": {
                                "type": "web_url",
                                "url": res['news'][i]['Share_URL'].replace('.com/','.com/amp/')
                            },
                           "buttons": [{
                                "type": "web_url",
                                "url": res['news'][i]['Share_URL'].replace('.com/','.com/amp/'),
                                "title": "Quick Brief"

                            },
                            {
                                "type": "web_url",
                                "url": res['news'][i]['Share_URL'],
                                "title": "Full Story"
                            }]
                    });

            }

            message = {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "generic",
                         "elements": jsonobj
                    }
                }
            }

            sendMessage(recipientId, message);

            return true;

        }

    });
}











function search_by_tag (recipientId, typed_word)
{

    // console.log("952");
     sendMessage(recipientId,  {text: "Just a sec, looking that up..." });



    request({
        url: 'http://api.amarujala.com/v1/search',
        qs: {keywords: typed_word},
        method: 'GET'
    },function(error, response, body){
        if(error)
           { console.log("797 erorr");
        console.log(error);
        }
        else
        {
            var res = JSON.parse(body);

            //console.log(JSON.stringify(res));

            var emptee = "{\"news\":[]}";
           //console.log("941",res['news'].length);

            if(res['news'].length != 0)
            {


            jsonobj = [];
            for (i=0;i<8 && i<res['news'].length;i++)
            {
                

                //If else needed to avoid replace error in images, as some images not present replaced with au logo
                if(res['news'][i]['image'])
                    {   jsonobj.push({
                            "title": res['news'][i]['Hindi-Headline'],
                            "subtitle": res['news'][i]['News-Synopsis'],
                            "image_url": res['news'][i]['image'].replace('250x250','500x500'),
                            "default_action": {
                                "type": "web_url",
                                "url": res['news'][i]['Share_URL'].replace('.com/','.com/amp/')
                            },
                            "buttons": [{
                                "type": "web_url",
                                "url": res['news'][i]['Share_URL'].replace('.com/','.com/amp/'),
                                "title": "Quick Brief"

                            },
                            {
                                "type": "web_url",
                                "url": res['news'][i]['Share_URL'],
                                "title": "Full Story"
                            }]
                    });
            }

            else
            {
                jsonobj.push({
                            "title": res['news'][i]['Hindi-Headline'],
                            "subtitle": res['news'][i]['News-Synopsis'],
                            "image_url": "http://chatbot.amarujala.com/assets/chatbot-au.jpg",
                            "default_action": {
                                "type": "web_url",
                                "url": res['news'][i]['Share_URL'].replace('.com/','.com/amp/')
                            },
                            "buttons": [{
                                "type": "web_url",
                                "url": res['news'][i]['Share_URL'].replace('.com/','.com/amp/'),
                                "title": "Quick Brief"

                            },
                            {
                                "type": "web_url",
                                "url": res['news'][i]['Share_URL'],
                                "title": "Full Story"
                            }]
                    });

            }

            }


            

            message = {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "generic",
                         "elements": jsonobj
                    }
                }
            }

            sendMessage(recipientId, message);

            return true;
        }

        else
            sendMessage(recipientId,  {text: "Sorry, we got nothing on this!!" });

        }


    });
}








function show_subscriptions(recipientId)
{
    var pop_coll = mongo_db.collection('popular');
    pop_coll.findOne({"fb_id" : recipientId }, function (err, docs){
        if(err)
            console.log("851 Error");
        if(docs)
        {
            if(docs['popular'] === true && docs['latest'] === true)
            {
                // console.log("If 1");

                message = {
                    "attachment": {
                        "type": "template",
                        "payload": {
                            "template_type": "generic",
                            "elements": [{
                                "title": "\"Most Popular\" News on Amarujala",
                                "image_url": "http://chatbot.amarujala.com/assets/chatbot-popular.jpg",
                                "buttons": [{
                                    "type": "postback",
                                    "title": "Unsubscribe",
                                    "payload": "Unsubscribe Popular"
                                },
                                {
                                    "type": "postback",
                                    "title": "Show Stories",
                                    "payload": "Popular News"
                                }
                                ]
                            },
                            {
                                "title": "\"Latest News\" on Amarujala",
                                "image_url": "http://chatbot.amarujala.com/assets/chatbot-latest.jpg",
                                "buttons": [{
                                    "type":"postback",
                                    "title": "Unsubscribe",
                                    "payload": "Unsubscribe Latest",
                                }, {
                                    "type": "postback",
                                    "title": "Show Stories",
                                    "payload": "Latest Headlines",
                                }
                                ]
                            }
                            ]
                        }

                    }
                }

                sendMessage(recipientId, message);

            }





            else if (docs['popular'] === true)
            {
                // console.log("if 2");

                message = {
                    "attachment": {
                        "type": "template",
                        "payload": {
                            "template_type" : "generic",
                            "elements": [{
                                "title": "\"Most Popular\" News on Amarujala",
                                "image_url": "http://chatbot.amarujala.com/assets/chatbot-popular.jpg",
                                "buttons": [{
                                    "type": "postback",
                                    "title": "Unsubscribe",
                                    "payload": "Unsubscribe Popular"
                                },
                                {
                                    "type": "postback",
                                    "title": "Show Stories",
                                    "payload": "Popular News"
                                }
                                ]
                            }
                            
                            ]

                        }
                    }
                }

                    sendMessage(recipientId, message);
                
            }




            else if (docs['latest'] ===  true)
            {
                // console.log("if 3");

                message = {
                    "attachment": {
                        "type": "template",
                        "payload": {
                            "template_type" : "generic",
                            "elements": [{
                                "title": "\"Latest News\" on Amarujala",
                                "image_url": "http://chatbot.amarujala.com/assets/chatbot-latest.jpg",
                                "buttons": [{
                                    "type":"postback",
                                    "title": "Unsubscribe",
                                    "payload": "Unsubscribe Latest",
                                }, {
                                    "type": "postback",
                                    "title": "Show Stories",
                                    "payload": "Latest Headlines",
                                }
                                ]
                            }
                            
                            ]

                        }
                    }
                }

                    sendMessage(recipientId, message);


            }





            else
                sendMessage(recipientId, {text: "It seems like you haven't subscribed anything." });

        }
        else  //this occurs when query returns empty brackets
        {
            sendMessage(recipientId, {text: "It seems like you haven't subscribed anything." });

        }
    });
}
