# EventHandler
register callbacks for browser/self-created events, handling and executing callbacks

**using this module for big JS or AngularJs Projects - more powerful and a better handling - replace all Listener or ng-click funtions with this functionality** 

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Installing

Download the file EventHandler.js and link them in your project like:
```html
<script src="EventHandler.js"></script>
```
or without downloading files like
```html
<script src="https://rawgit.com/SebCon/EventHandler/master/EventHandler.js"></script>
```

### Example
here is a example with two input fields for using EventHandler:

```html
<input id="field1" type="text" />
<input id="field2" type="text" />
```
Now you can register your callbacks
```javascript
  EventHandler.registerElementById('field1', 'click', function() { console.log('click in field1'); });
  EventHandler.registerElement('input', 'keypress', function(e) {
    console.log('keypress!');
    console.log(e);
  });
```
If you click in input field with id *field1*, in your console window the message *click in field1* appears.
If you in any input field and pressing any key, in your console window the message *keypress* and the listing of the event appears.
       

## Authors

* **Sebastian Conrad** - [sebcon](http://www.sebcon.de)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details



