import PageManager from '../page-manager';
import {
    getEvents,
    events,
    } from './universal-blocks';
export default class DesignerEventList extends PageManager {
    constructor(context) {
        super(context);
    }
    onReady() {
        getEvents(this.context, response => {
            document.getElementById('contentBlocksCollection').innerHTML = events(response.data,'eventspage');
        });
    }
}