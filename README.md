# StumbleBot

The **StumbleBot** is a UserScript written in JavaScript designed to enhance the user experience on **StumbleChat**, a web-based chat platform. It adds additional functionality for handling specific chat messages, enabling media playback, and providing custom commands within the chat room.

The script modifies the behavior of WebSocket communication to intercept and manipulate messages. It establishes a WebSocket connection with the chat server and overrides the `send` method to intercept outgoing messages, allowing for dynamic responses and actions based on user input.

---

## Features

- **YouTube Playback**: Play YouTube videos directly from the chat box using the `.yt` command.
- **Custom Commands**: Add and manage custom commands for fun and utility.
- **User Interaction**: Welcome new users, track nicknames, and respond to specific triggers.
- **Scheduled Messages**: Automatically send messages at specific times (e.g., 4:20 alerts).
- **Dynamic Responses**: Respond to user messages with predefined or randomized replies.

---

## Commands

Here are some of the key commands supported by StumbleBot:

### YouTube Commands
- **`.yt [query]`**: Play a YouTube video. Example: `.yt https://www.youtube.com/watch?v=dQw4w9WgXcQ`

### User Commands
- **`.me [message]`**: Send a message as yourself. Example: `.me is dancing!`

### General Commands
- **`.commands`**: List all available commands.

### Trigger Commands
- **`ping`**: Responds with `PONG`.

---

## Installation

The script is available on **GreasyFork**:  
[Install StumbleBot](https://greasyfork.org/en/scripts/526343-stumblebot)

