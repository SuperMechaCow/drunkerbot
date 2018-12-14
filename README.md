# drunkerbot
A robot for doing things humans are too drunk to do themselves

DrunkerBot is made up of three major parts:

## Discord Bot

Use `!db help` to get a list of commands DrunkerBot has. Using these commands, users can designate themselves as a host for a DrunkerBox livestream and provide others with information on it.

## DrunkerBox API

Sending a GET request to https://drunkerbot.hardwareflare.com/api/status/<property> will return information about the bot and the current livestream state as a single parameter or in JSON format.

## DrunkerBox Web Page

https://drunkerbot.hardwareflare.com/ displays information about the bot and the livestream in human-readable format.
