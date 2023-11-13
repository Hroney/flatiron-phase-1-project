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
> 
#### Game Play
> Select a letter from the valid word 
> 
#### returns 'phenomenon'
> foobar.singularize('phenomena')


## Contributing

Pull requests are welcome. For major changes, please open an issue first
to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

[MIT](https://choosealicense.com/licenses/mit/)
