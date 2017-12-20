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
            items: [],
            emptyMessage: 'No projects to display.',
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
                this.projectSelectList.element.dataset.projectName = item.name;
                // this.projectSelectList.update({items: []});
            }
        });

        if (this.projectSelectList.refs.queryEditor.element) {
            this.projectSelectList.refs.queryEditor.element.addEventListener(
                'focus',
                () => {
                    this.projectSelectList.element.classList.add('focus');
                }
            );
            this.projectSelectList.refs.queryEditor.element.addEventListener(
                'blur',
                () => {
                    this.projectSelectList.element.classList.remove('focus');
                }
            );
        }
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
        window.plop=features;
        this.ulElement.innerHTML = '';
        let i;
        let j;
        for (i = 0; i < features.length; ++i) {
            this.ulElement.appendChild(
                this.createFeatureElement(features[i])
            );
            // if (features[i].subitems && features[i].subitems.count) {
            //     console.log('has subitems');
            //     console.log(features[i].subitems.get());
            //     for (j = 0; j < features[i].subitems.count; ++j) {
            //
            //         this.ulElement.appendChild(
            //             this.createFeatureElement(features[i].subitems[j])
            //         );
            //     }
            // }
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
        let idElement = document.createElement('a');
        let nameElement = document.createElement('span');
        let statusElement = document.createElement('span');
        let priorityElement = document.createElement('span');
        let descriptionElement = document.createElement('div');

        idElement.className = 'atom-axosoft-feature-id';
        nameElement.className = 'atom-axosoft-feature-name';
        statusElement.className = 'atom-axosoft-feature-status';
        priorityElement.className = 'atom-axosoft-feature-priority';
        switch(feature.priority.name) {
            case 'High':
                liElement.className += ' atom-axosoft-feature-priority-high';
                // priorityElement.textContent = '^';
                break;
            case 'Medium':
                liElement.className += ' atom-axosoft-feature-priority-medium';
                // priorityElement.textContent = '';
                break;
            case 'Low':
                liElement.className += ' atom-axosoft-feature-priority-low';
                // priorityElement.textContent = 'v';
                break;
        }
        descriptionElement.className = 'atom-axosoft-feature-description';

        liElement.dataset.id = feature.id;
        idElement.href = atom.config.get('atom-axosoft.axosoftUrl') +
            '/viewitem' +
            '?id=' + feature.id +
            '&type=' + feature.type +
            '&force_use_number=true';
        idElement.title = 'Open in axosoft';
        idElement.textContent = feature.id;
        nameElement.textContent = feature.name || '(No name)';
        statusElement.textContent = feature.workflow_step.name;
        // priorityElement.textContent = feature.priority.name;
        descriptionElement.innerHTML = feature.description || '(No description)';

        liElement.appendChild(idElement);
        liElement.appendChild(nameElement);
        liElement.appendChild(statusElement);
        liElement.appendChild(priorityElement);
        liElement.appendChild(descriptionElement);

        liElement.addEventListener(
            'click',
            () => {
                let isOpen = liElement.classList.contains('atom-axosoft-open');
                liElement.parentElement
                    .querySelectorAll('li')
                    .forEach(element => {
                        element.classList.remove('atom-axosoft-open')
                    });
                if (!isOpen) {
                    liElement.classList.add('atom-axosoft-open');
                }
            }
        );

        return liElement;
    }

}
