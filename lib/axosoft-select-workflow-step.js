'use babel';

import {SelectListView} from 'atom-space-pen-views';

export default class AxosoftWorkflowStepSelector extends SelectListView {
    initialize() {
        super.initialize(...arguments);
        this.onConfirmedCallback = null;
        this.onCancelledCallback = null;
        this.panel = null;
        this.workflows = [];
        this.feature = null;
        this.addClass('overlay from-top');
        // this.setItems(['Hello', 'World']);
        if (this.panel == null) {
            this.panel = atom.workspace.addModalPanel({
                item: this,
                visible: false
            });
        }
    }

    selectWorkflowStep(feature) {
        this.feature = feature;
        //  @TODO:  Select the appropriate set of workflow steps
        //          for this item / feature.
        this.setItems(this.workflows[1].workflow_steps);
        this.panel.show();

        return this.focusFilterEditor();
    }

    setWorkflows(workflows) {
        this.workflows = workflows;
    }

    onConfirmed(callback) {
        this.onConfirmedCallback = callback;
    }

    onCancelled(callback) {
        this.onCancelledCallback = callback;
    }

    viewForItem(item) {
        return `<li data-id="${item.id}">${item.name}</li>`;
    }

    confirmed(item) {
        this.panel.hide();
        if (this.onConfirmedCallback) {
            return this.onConfirmedCallback(item, this.feature);
        }
    }

    cancelled() {
        this.panel.hide();
        if (this.onCancelledCallback) {
            return this.onCancelledCallback();
        }
    }
}
