define([
],
function() {
	var LocalStorage = {
        set: function(key, value) {
            window.localStorage.setItem(key, value);
        },

        get: function(key) {
            return window.localStorage.getItem(key);
        },

		unset: function(key) {
			window.localStorage.removeItem(key);
		},

		setJSON: function(key, object) {
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
			   this.setJSON(keyOfArray, arr);
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
			this.setJSON(keyOfArray, arr);
		}
	};

	return LocalStorage;
});