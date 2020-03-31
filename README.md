# drunkerbot
A robot for doing things humans are too drunk to do themselves

DrunkerBot is made up of three major parts:

## Discord Bot

Use `!#help` (command prefix is set in modules/settings.js) to get a list of commands DrunkerBot has. Using these commands, users can designate themselves as a host for an Event and provide others with information on it.

## DrunkerBox API

Sending a GET request to https://<bot ip>/api/status/<property> will return information about the bot and the current Event state as a single parameter or in JSON format.

## DrunkerBox Web Page

https://<bot ip>/ displays information about the bot and Events in human-readable format.
