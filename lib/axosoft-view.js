'use babel';

export default class AxosoftView {

    constructor(serializedState) {
        // Create root element
        this.element = document.createElement('div');
        this.element.classList.add('axosoft');

        // Create message element
        const message = document.createElement('div');
        message.textContent = 'Axosoft features';
        message.classList.add('message');
        this.element.appendChild(message);
    }

    // Returns an object that can be retrieved when package is activated
    serialize() {}

    // Tear down any state and detach
    destroy() {
        this.element.remove();
    }

    getElement() {
        return this.element;
    }

    getTitle() {
        return 'Axosoft';
    }

    getURI() {
        return 'atom://axosoft';
    }

    getDefaultLocation(){
        return 'right';
    }


    getAllowedLocations() {
        return ['right', 'left'];
    }


    setFeatures(features) {
        let ulElement = document.createElement('ul');
        for (let i = 0; i < features.length; ++i) {
            ulElement.appendChild(
                this.createFeatureElement(features[i])
            );
        }
        ulElement.className = 'axosoft-feature-list';
        this.element.appendChild(ulElement);
    }

    createFeatureElement(feature) {
        let liElement = document.createElement('li');
        let statusElement = document.createElement('span');
        let nameElement = document.createElement('span');
        let priorityElement = document.createElement('span');

        statusElement.className = 'axosoft-feature-status';
        nameElement.className = 'axosoft-feature-name';
        priorityElement.className = 'axosoft-feature-priority';
        switch(feature.priority.name) {
            case 'High':
                liElement.className += ' axosoft-feature-priority-high';
                break;
            case 'Medium':
                liElement.className += ' axosoft-feature-priority-medium';
                break;
            case 'Low':
                liElement.className += ' axosoft-feature-priority-low';
                break;
        }

        liElement.dataset.id = feature.id;
        statusElement.textContent = feature.id;
        nameElement.textContent = feature.name;
        priorityElement.textContent = feature.priority.name;
        //JSON.stringify(feature.priority);

        liElement.appendChild(statusElement);
        liElement.appendChild(nameElement);
        liElement.appendChild(priorityElement);

        return liElement;
    }

}
