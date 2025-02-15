// ==UserScript==
// @name         StumbleBot
// @namespace    StumbleBot
// @version      1.0.1
// @description  Play youtube videos from the chat box and/or add custom commands to StumbleChat
// @author       Goji
// @match        https://stumblechat.com/room/*
// ==/UserScript==

let lastSentHour = -1;
let shouldSendMessage = false;

setInterval(() => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentSecond = now.getSeconds();

    // Ensure the message is only scheduled once per hour at HH:20:00
    if (currentMinute === 20 && currentSecond === 0 && lastSentHour !== currentHour && !shouldSendMessage) {
        lastSentHour = currentHour;
        shouldSendMessage = true; // Set flag
    }
}, 1000);

(function() {
    // Load userNicknames from localStorage (if any)
    let userNicknames = JSON.parse(localStorage.getItem('userNicknames')) || {};

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

        // Store user's nickname and info when they join
        if (wsmsg['stumble'] === 'join' && wsmsg['nick'] && wsmsg['username'] && wsmsg['handle']) {
            const username = wsmsg['username'];
            let nickname = wsmsg['nick'];
            const handle = wsmsg['handle'];

            // If nickname starts with "guest-" followed by numbers, use username instead
            if (/^guest-\d+$/i.test(nickname)) {
                nickname = username;
            }

            // Check if user has been here before
            if (userNicknames[username]) {
                // User is returning, send a "welcome back" message using username
                respondWithMessage.call(this, `Welcome back, ${nickname || username}!`);
            } else {
                // First-time user, send a "welcome" message using username
                respondWithMessage.call(this, `Welcome, ${nickname || username}!`);
            }

            // Store or update the user's info using both username and handle
            userNicknames[username] = {
                handle: handle,
                username: username,
                nickname: nickname || username,
                modStatus: wsmsg['mod'] ? "Moderator" : "Regular"
            };
            userNicknames[handle] = {
                handle: handle,
                username: username,
                nickname: nickname || username,
                modStatus: wsmsg['mod'] ? "Moderator" : "Regular"
            };

            // Save the updated userNicknames to localStorage
            localStorage.setItem('userNicknames', JSON.stringify(userNicknames));
        }

        // Send 420 alert
        if (shouldSendMessage) {
            shouldSendMessage = false; // Reset the flag immediately to prevent multiple sends

            setTimeout(() => {
                this._send('{"stumble":"msg","text": "🌲 It\'s 4:20 somewhere! Smoke em if you got em! 💨"}');
            }, 1000); // 1-second delay to send at HH:20:01
        }

        //-----------------------------------------------------------------------------------------------------------------------------------
        // Bot Commands ---------------------------------------------------------------------------------------------------------------------
        //-----------------------------------------------------------------------------------------------------------------------------------

        // Example YouTube command
        if (wsmsg['text'].startsWith(".yt ")) {
            const query = wsmsg['text'].slice(4).trim();
            if (query) {
                this._send(`{"stumble": "youtube","type": "add","id": "${query}","time": 0}`);
            }
        }

        // Example user command
        if (wsmsg['text'].startsWith(".me ")) {
            const handle = wsmsg['handle'];
            const nickname = userNicknames[handle]?.nickname || "User";
            const message = wsmsg['text'].slice(4).trim();
            respondWithMessage.call(this, `${nickname} ${message}`);
        }

        // Example general command
        if (wsmsg['text'] === ".commands") {
            const commandsList = [
                "- .yt [query] - Play a YouTube video",
                "- .me [message] - Send a message as yourself",
                "- .commands - List all commands"
            ];

            commandsList.forEach((command, index) => {
                setTimeout(() => {
                    respondWithMessage.call(this, command);
                }, index * 1000); // 1-second delay between commands
            });
        }

        // Example trigger command
        if (wsmsg['text'] === "ping") {
            setTimeout(() => {
                respondWithMessage.call(this, "PONG");
            }, 1000);
        }

        //-----------------------------------------------------------------------------------------------------------------------------------
    }

    // Handle the command
    function handleChatMessage(wsmsg) {
        const { text, handle } = wsmsg;

        //--------------------------------------------------------------------------------------------------------------------
        // Bot Commands
        //--------------------------------------------------------------------------------------------------------------------

        if (text === ".command") {
            respondWithMessage.call(this, "result");
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
        } catch (error) {
            // If an error occurs during the execution of the code within the try block, the program flow will be redirected to this catch block. The error parameter captures the error object that was thrown.
            console.error('Error parsing JSON:', error);
            // In the event of an error during the parsing process, this line is executed, and null is returned. It serves as a default return value when the JSON parsing fails.
            return null;
        }
    }
})();