### [MINOR] 3.3.0
- Added 'role', 'unrole', and 'makerole' to inactive commands
- Fixed 'git' command error

### [MINOR] 3.2.0
- Express routes now loaded automatically from 'routes' folder
- Fixed loading prefix for commands from settings.js
- Fixed up templates for new bots
- 'new' command is now 'command_tamplate.js'
- 'ready' event listener now sets Presence to help
- Added 'urlAPI', 'urlWEB', and 'urlGIT' back into settings.js
- Fixed new bug with 'roll' command
- Changed automatic bot status in 'ready.js'
- Invalid commands now prompt the user with 'help' command
- Moved command loading from 'dbot.js' to 'modules/commands.js'
- Added 'reload' command to rescan the 'commands' folder
- 'git' command loaded by default
- 'help' now shows prefix properly
- 'cat' now loads all jpg's from 'data/cats' folder and displays randomly
