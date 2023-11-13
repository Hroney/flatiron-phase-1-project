# phase-1-project

Phase-1-project is a single html/javascript project for the first phase of the Flatiron school.
This is a word tool that I put together, inspired by my D&D campaign I'm a player in.

## Installation

Fork and clone on github.

Open two terminals and navigate to the cloned location.

Ensure that you have json-server installed globally on your machine
```
$ npm install -g json-server
```

Start up the json server in a second terminal
```
$ json-server --watch db.json
```

Open the index.html file from one of the terminals
```
$ explorer.exe index.html
```


## Usage

#### Game start
> Input a valid word into the empty text box.
> - Valid words are single, non-punctuated, non-spaced, non-numbered words.
> - An improperly formated word or undefined word will default to an empty text box.
> ![](https://github.com/Hroney/flatiron-phase-1-project/blob/main/readmefiles/game%20start.gif)
#### Game Play
> Select a letter from the valid word
> ![](https://github.com/Hroney/flatiron-phase-1-project/blob/main/readmefiles/game%20play.gif)
>
> Select the word you wish to make the current "playable" word
> ![](https://github.com/Hroney/flatiron-phase-1-project/blob/main/readmefiles/game%20play%202.gif)
>
> Repeat to see how you can morph a word from one to another. (e.g. Hat -> Eat -> Ear)
> ![](https://github.com/Hroney/flatiron-phase-1-project/blob/main/readmefiles/game%20play%203.gif)
#### Features
> A `Reset` button in the top left deletes all of the saved json data in the db.json file if you wish to (Who asked for this feature? Me! I was debugging and needed this)
>
> Hover over the center section to view the rules in a simple format
> ![](https://github.com/Hroney/flatiron-phase-1-project/blob/main/readmefiles/Rules.gif)


## Acknowledgments

#### API used
> https://dictionaryapi.dev/

