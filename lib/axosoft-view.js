'use babel';

// import { Emitter } from 'atom';
// const Emitter = require('event-kit');
// const Emitter = require('event-kit');
import { Emitter } from 'event-kit';
// import { Emitter } from 'atom/event-kit';
const SelectList = require('atom-select-list');


export default class AxosoftView {

    constructor(serializedState) {
        this.emitter = new Emitter;
        // Create root element
        this.element = document.createElement('div');
        this.element.classList.add('atom-axosoft');


        this.projectSelectList = new SelectList({
            items: [
                {
                    name: 'Alice'
                },
                {
                    name: 'Bob'
                }
            ],
            didChangeQuery: (query) => {
                //  initiallyVisibleItemCount: 1,
                if (query) {
                    this.projectSelectList.element.classList.add('active');
                } else {
                    this.projectSelectList.element.classList.remove('active');
                }
            },
            didCancelSelection: () => {
                this.projectSelectList.reset();
            },
            elementForItem: (item, options) => {
                let element = document.createElement('div');
                element.innerHTML = item.name;
                return element;
            },
            filterKeyForItem: (item) => {
                return item.name;
            },
            didConfirmSelection: (item) => {
                this.emitter.emit('did-select-project', item);
                this.projectSelectList.reset();
                // this.projectSelectList.update({items: []});
            }
        });
        this.element.appendChild(this.projectSelectList.element);

        let reloadProjectsElement = document.createElement('a');
        reloadProjectsElement.textContent = 'reload projects';
        reloadProjectsElement.addEventListener(
            'click',
            () => {
                console.log('requestProjects');
                this.emitter.emit('did-request-projects');
            }
        );
        this.element.appendChild(reloadProjectsElement);

        this.ulElement = document.createElement('ul');
        this.ulElement.className = 'atom-axosoft-feature-list';
        this.element.appendChild(this.ulElement);

        // this.populateProjectDropdown();


        // // Create message element
        // const message = document.createElement('div');
        // message.textContent = 'Axosoft features';
        // message.classList.add('message');
        // this.element.appendChild(message);
    }

    // requestProjects() {
    //     console.log('requestProjects');
    //     this.emitter.emit('did-request-projects');
    // }

    onDidRequestProjects(callback) {
        return this.emitter.on('did-request-projects', (filters) => {
            console.log('onDidRequestProjects fired');
            callback(filters);
        });
    }

    onDidSelectProject(callback) {
        return this.emitter.on('did-select-project', (project) => {
            console.log('onDidSelectProject fired');
            callback(project);
        });
    }


    // populateProjectDropdown() {
    //     this.axosoftModule.fetchProjects();
    // }

    // Returns an object that can be retrieved when package is activated
    serialize() {}

    // Tear down any state and detach
    destroy() {
        this.element.remove();
        this.emitter.dispose();
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
        this.ulElement.innerHTML = '';
        for (let i = 0; i < features.length; ++i) {
            this.ulElement.appendChild(
                this.createFeatureElement(features[i])
            );
        }
    }

    setProjects(projects) {
        let flatProjectList = [];
        this.addProjects(projects, flatProjectList);
        this.projectSelectList.update({
            items: flatProjectList
        });
    }


    addProjects(projects, flatProjectList) {
        for (let i = 0; i < projects.length; ++i) {
            flatProjectList.push(projects[i]);
            if (projects[i].children) {
                this.addProjects(projects[i].children, flatProjectList);
            }
        }
    }

    createFeatureElement(feature) {
        let liElement = document.createElement('li');
        let statusElement = document.createElement('span');
        let nameElement = document.createElement('span');
        let priorityElement = document.createElement('span');

        statusElement.className = 'atom-axosoft-feature-status';
        nameElement.className = 'atom-axosoft-feature-name';
        priorityElement.className = 'atom-axosoft-feature-priority';
        switch(feature.priority.name) {
            case 'High':
                liElement.className += ' atom-axosoft-feature-priority-high';
                break;
            case 'Medium':
                liElement.className += ' atom-axosoft-feature-priority-medium';
                break;
            case 'Low':
                liElement.className += ' atom-axosoft-feature-priority-low';
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
