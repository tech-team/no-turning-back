define([
	'classy'
],
function(Class) {
	var LocalStorage = Class.$extend({
		__init__: function() {
			
		},

        add: function(key, value) {
            window.localStorage.setItem(key, value);
        },

		remove: function(key) {
			window.localStorage.removeItem(key);
		},

		addJSON: function(key, object) {
			window.localStorage.setItem(key, JSON.stringify(object));
		},

		getJSON: function(key) {
			var value = window.localStorage[key];
    		return value ? JSON.parse(value) : null;
		},

		addToArray: function(keyOfArray, element) {
			var limit = 20;

			if (!window.localStorage[keyOfArray])
				window.localStorage[keyOfArray] = '[]';
			var arr = this.getJSON(keyOfArray);
			if (arr.length == limit) {
				alert('You are not allowed to have more than ' + limit + ' locally saved scores');
			}

			if(Object.prototype.toString.call(arr) === '[object Array]') {
			   arr.push(element);
			   this.addJSON(keyOfArray, arr);
			}
			else {
				throw "Not an array";
			}
		},

		popFromArray: function(keyOfArray) {
			var arr = this.getJSON(keyOfArray);
			if (!arr || Object.prototype.toString.call(arr) !== '[object Array]')
				console.log("Problem loading localstorage value");

			arr.pop();
			this.addJSON(keyOfArray, arr);
		}
	});

	return new LocalStorage();
});