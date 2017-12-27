'use babel';

import {SelectListView} from 'atom-space-pen-views';

export default class AxosoftWorkflowStepSelector extends SelectListView {
    initialize() {
        super.initialize(...arguments);
        this.onConfirmedCallback = null;
        this.onCancelledCallback = null;
        this.addClass('overlay from-top');
        // this.setItems(['Hello', 'World']);
        if (this.panel == null) { this.panel = atom.workspace.addModalPanel({item: this}); }

    }

    selectWorkflowStep(workflowStep) {
        this.panel.show();

        return this.focusFilterEditor();
    }

    onConfirmed(callback) {
        this.onConfirmedCallback = callback;
    }

    onCancelled(callback) {
        this.onCancelledCallback = callback;
    }

    viewForItem(item) {
        return `<li>${item}</li>`;
    }

    confirmed(item) {
        if (this.onConfirmedCallback) {
            return this.onConfirmedCallback();
        }
    }

    cancelled() {
        if (this.onCancelledCallback) {
            return this.onCancelledCallback();
        }
    }
}
