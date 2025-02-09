// ==UserScript==
// @name         StumbleBot
// @namespace    StumbleBot
// @version      1.0
// @description  Play youtube videos from the chat box and/or add custom commands to StumbleChat
// @author       Goji
// @match        https://stumblechat.com/room/*
// ==/UserScript==
// The StumbleChat Bot is a UserScript written in JavaScript designed to enhance the user experience on StumbleChat, a web-based chat platform, by adding additional functionality for handling specific chat messages and enabling media playback within the chat room.
// The script modifies the behavior of WebSocket communication to intercept and manipulate messages. It establishes a WebSocket connection with the chat server and overrides the send method to intercept outgoing messages.

(function() {
    WebSocket.prototype._send = WebSocket.prototype.send;
    WebSocket.prototype.send = function(data) {
        this._send(data);

        this.addEventListener('message', handleMessage.bind(this), false);

        this.send = function(data) {
            console.log('send:', data);
            const sendData = safeJSONParse(data);

            if (sendData && sendData['stumble'] === 'subscribe') {
                console.log('subscribe caught');
            } else {
                this._send(data);
            }
        };
    };

    function handleMessage(msg) {
        console.log('<<', msg.data);
        const wsmsg = safeJSONParse(msg.data);
        console.log(wsmsg);

        // Convert the incoming message to lowercase
        //const message = wsmsg['text'].toLowerCase();

//-----------------------------------------------------------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------------------------------------------------------        

        // Bot Commands

//-----------------------------------------------------------------------------------------------------------------------------------

        //start example command
        if (wsmsg['text'] === ".command") {
            this._send('{"stumble":"msg","text": "result"}')
        }

//-----------------------------------------------------------------------------------------------------------------------------------

        // Define an array of keywords to check for YouTube-related commands
        var keywords = ['.youtube', '.video', '.play', '.yt'];

        // Function to convert various YouTube URL formats to a standard format
        function convertToRegularYouTubeLink(url) {
            // Improved regex to extract video ID from multiple YouTube URL formats
            var videoIdRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/|.*[?&]v=))([\w-]+)/;
            var match = url.match(videoIdRegex);
            if (match && match[1]) {
                return 'https://www.youtube.com/watch?v=' + match[1];
            }
            return null; // Return null if the URL doesn't match
        }

        // Loop through each keyword in the keywords array
        for (var i = 0; i < keywords.length; i++) {
            // Check if the "text" property in wsmsg starts with the current keyword
            if (wsmsg['text'].startsWith(keywords[i])) {
                // Extract the query part of the message after the keyword
                var query = wsmsg['text'].substring(keywords[i].length).trim();

                // Check if the query is not empty
                if (query) {
                    // Check if the query is a YouTube URL and convert it
                    var regularLink = convertToRegularYouTubeLink(query);
                    if (regularLink) {
                        // Send a formatted message with the converted YouTube link
                        this._send('{"stumble": "youtube","type": "add","id": "' + regularLink + '","time": 0}');
                    } else {
                        // Handle non-URL queries as is (e.g., search terms)
                        this._send('{"stumble": "youtube","type": "add","id": "' + query + '","time": 0}');
                    }
                }

                // Exit the loop as the query has been processed
                break;
            }
        }

//-----------------------------------------------------------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------------------------------------------------------        

        if (!wsmsg) {
            console.error('Invalid JSON message received:', msg.data);
            return;
        }
        if (wsmsg['stumble'] === 'msg') { // check the value of the stumble property in the wsmsg object. If the value is 'msg', it calls the handleChatMessage function with wsmsg as the parameter.
            handleChatMessage.call(this, wsmsg);
        }
    }

    function handleChatMessage(wsmsg) {
        const {
            text
        } = wsmsg;

        if (text.startsWith('.imgur ')) {
            respondWithMessage.call(this, 'Imgur functionality has been removed.');
        } else if (text.startsWith('upload ')) {
            respondWithMessage.call(this, 'Imgur functionality has been removed.');
        }
    }

    // This code defines the respondWithMessage function, which takes a text parameter. It sends a response message to the server. The text parameter represents the content of the message.
    function respondWithMessage(text) {

        // Invokes the _send method/function of the current object instance. It sends a JSON stringified object as the payload. The object has a stumble property set to 'msg' and a text property set to the text parameter value.
        this._send(JSON.stringify({
            stumble: 'msg',
            text
        }));
    }

    // Safely parses a JSON string.
    function safeJSONParse(jsonString) {

        // Starts a block of code that will be executed. It is used in conjunction with the catch keyword to handle potential errors that may occur during the execution of the code within the try block.
        try {

            // Attempts to parse the jsonString variable as a JSON string and convert it into a JavaScript object. The JSON.parse() method is used for this purpose. If the parsing is successful, the parsed JavaScript object is returned.
            return JSON.parse(jsonString);

            // If an error occurs during the execution of the code within the try block, the program flow will be redirected to this catch block. The error parameter captures the error object that was thrown.
        } catch (error) {

            // This line logs an error message to the console, indicating that an error occurred while parsing the JSON. The specific error message is passed as the second argument to console.error(). The error object contains information about the error that occurred.
            console.error('Error parsing JSON:', error);

            // In the event of an error during the parsing process, this line is executed, and null is returned. It serves as a default return value when the JSON parsing fails.
            return null;
        }
        // This closing curly brace marks the end of the catch block. It signifies the end of the error handling code.
    }
})();