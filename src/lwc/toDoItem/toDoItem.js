/**
 * ToDoItem component
 * Provides ability to edit/remove the item
 */
import { api, LightningElement } from 'lwc';
import updateTodo from "@salesforce/apex/ToDoController.updateTodo";
import deleteTodo from "@salesforce/apex/ToDoController.deleteTodo";

export default class ToDoItem extends LightningElement {
    @api todoId;
    @api todoName;
    @api done = false;
    /*
    * Update handler to edit current item
    * You can switch the item status between completed and uncompleted
    * Make a call to server to update the item
    */
    updateHandler() {
        const todo = {
            todoId: this.todoId,
            done: !this.done,
            todoName: this.todoName
        };
        updateTodo({ payload: JSON.stringify(todo) })
            .then(result => {
                const updateEvent = new CustomEvent("update", { detail: todo });
                this.dispatchEvent(updateEvent);
            })
            .catch(error => {
                console.error("Error in updating records ", error);
            });
    }
    /*
    * Delete handler to delete current item
    * Make a call to server to delete the item
    */
    deleteHandler() {
        deleteTodo({ todoId: this.todoId })
            .then(result => {
                this.dispatchEvent(new CustomEvent("delete", { detail: this.todoId }));
            })
            .catch(error => {
                console.error("Error in updating records ", error);
            });
    }
    get buttonIcon() {
        return this.done ? "utility:check" : "utility:add";
    }
    get containerClass() {
        return this.done ? "todo completed" : "todo upcoming";
    }
}