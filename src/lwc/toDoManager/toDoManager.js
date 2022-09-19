import { LightningElement, track, api } from 'lwc';
import getCurrentTodos from "@salesforce/apex/ToDoController.getCurrentTodos";
import addTodo from '@salesforce/apex/ToDoController.addTodo';
import todoMorningLogo from '@salesforce/resourceUrl/todoMorningLogo';
import todoAfternoonLogo from '@salesforce/resourceUrl/todoAfternoonLogo';
import todoEveningLogo from '@salesforce/resourceUrl/todoEveningLogo';

export default class ToDoManager extends LightningElement {
    @api flexipageRegionWidth;
    @track time;
    @track greeting;
    @track pictureUrl;
    @track todos = [];
    connectedCallback() {
        this.getTime();
        this.fetchTodos();
        setInterval(() => {
            this.getTime();
        }, 1000);
    }
    getTime() {
        const date = new Date();
        const hour = date.getHours();
        const min = date.getMinutes();
        const sec = date.getSeconds();
        this.time = `${this.getHour(hour)}:${this.getDoubleDigit(min)}:${this.getSec(sec)} 
        ${this.getMidDay(hour)}`;
        this.setGreeting(hour);
    }
    // get hours in 12 Hour
    getHour(hour) {
        return hour === 0 ? 12 : hour > 12 ? (hour - 12) : hour;
    }
    // get second
    getSec(sec) {
        return sec < 10 ? "0" + sec : sec;
    }
    // get PM or AM
    getMidDay(hour) {
        return hour >= 12 ? "PM" : "AM";
    }
    // get Double Digit --> if We have 1 then convert it into 01
    getDoubleDigit(digit) {
        return digit < 10 ? "0" + digit : digit;
    }
    //get Greeting as related Hour and Image
    setGreeting(hour) {
        if (hour < 12) {
            this.pictureUrl = todoMorningLogo;
            this.greeting = "Good Morning";
        } else if (hour >= 12 && hour < 17) {
            this.pictureUrl = todoAfternoonLogo;
            this.greeting = "Good Afternoon";
        } else {
            this.pictureUrl = todoEveningLogo;
            this.greeting = "Good Evening";
        }
    }
    /*
    * Add todos to backend
    * Get todo item based on input box value, and add to Salesforce object
    * Fetch fresh list of todos once inserted
    */
    addTodoHandler() {
        const inputBox = this.template.querySelector("lightning-input");
        const todo = { todoName: inputBox.value, done: false };
        const pay = { payload: JSON.stringify(todo) };
        addTodo({ payload: JSON.stringify(todo) })
            .then(result => {
                if (result) {
                    console.log("9 ", "sbdd" + result);
                    this.fetchTodos();
                }
            })
            .catch(error => {
                console.error("Error in adding todo" + error);
            });
        inputBox.value = "";
    }
    /*
    * Fetch todos from server
    * This method only retrives todos for today
    */
    fetchTodos() {
        getCurrentTodos()
            .then(result => {
                if (result) {
                    this.todos = result;
                    console.log('12 : ', JSON.stringify(result));
                }
            })
            .catch(error => {
                console.error("Error in fetching todo" + error);
            });
    }
    /*
    * Fetch fresh list of todos once todo is updated
    * This method is called on update event
    */
    updateTodoHandler(event) {
        if (event) {
            this.fetchTodos();
        }
    }
    /*
    * Fetch fresh list of todos once todo is deleted
    * This method is called on delete event
    */
    deleteTodoHandler(event) {
        if (event) {
            this.fetchTodos();
        }
    }
    // get property to return upcoming/unfinished todos
    get upcomingTodos() {
        return this.todos && this.todos.length
            ? this.todos.filter(todo => !todo.done)
            : [];
    }
    // get property to return completed todos
    get completedTodos() {
        return this.todos && this.todos.length
            ? this.todos.filter(todo => todo.done)
            : [];
    }
    //Get input box size based on current screen width
    get largePageSize() {
        return this.flexipageRegionWidth === "SMALL"
            ? "12"
            : this.flexipageRegionWidth === "MEDIUM"
                ? "8"
                : "6";
    }
}