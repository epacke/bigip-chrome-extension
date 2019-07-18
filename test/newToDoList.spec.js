var chai = require('chai');
var should = chai.should();
var newToDoList = require('../js/newToDoList');
var settings = require('../settings/settings');

describe('New To-do List', function(){

    it('Should return a valid object', function(){
        var toDoListType = typeof(newToDoList());
        toDoListType.should.equal('object');
    })

    it('Should contain all keys from settings', function(){

        var toDoList = newToDoList();
        
        Object.keys(settings.toDos).some(function(key){
            return !(key in toDoList);
        }).should.be.false;

    })

})

