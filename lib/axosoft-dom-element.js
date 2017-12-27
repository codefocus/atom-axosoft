'use babel';

import * as linkify from 'linkifyjs';
import linkifyHtml from 'linkifyjs/html';

export default class AxosoftDomElement {
    constructor() {
    }

    prefixClass(className) {
        return 'atom-axosoft-' + className;
    }

    addClass(element, className, isPrefixed = true) {
        element.classList.add(
            isPrefixed ? this.prefixClass(className) : className
        );
    }

    removeClass(element, className) {
        element.classList.remove(
            this.prefixClass(className)
        );
    }

    simplifyHTML(html) {
        if ( ! html) {
            return '';
        }
        let preserveTags = [
            'p',
            'strong', 'b',
            'em', 'i',
            'pre', 'code',
            'u',
            'a',
            'br',
            'ul', 'ol', 'li',
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6'
            // 'table', 'tr', 'th', 'td'
        ];
        let preserveAttributes = [
            'a',
            'img'
        ];
        let element;
        if (typeof html == 'string') {
            element = document.createElement('div');
            element.innerHTML = html;
            if ( ! element.childElementCount) {
                return linkifyHtml(
                    html.replace(/[\s\r\n]+/, ' ')
                );
            }
        } else {
            element = html;
            if ( ! element.hasChildNodes()) {
                return linkifyHtml(
                    element.textContent.replace(/[\s\r\n]+/, ' ')
                );
            }
        }
        let brCount = 0;
        let simplifiedHTML = '';
        for (let i = 0; i < element.childNodes.length; ++i) {
            let childNode = element.childNodes[i];
            let childHTML = this.simplifyHTML(childNode);
            let childTag = childNode.nodeName.toLowerCase();

            if (preserveTags.includes(childTag)) {
                if (childTag == 'br') {
                     if (++brCount > 2) {
                         continue;
                     }
                } else {
                     brCount = 0;
                }
                simplifiedHTML += '<' + childTag
                if (preserveAttributes.includes(childTag)) {
                    for (let j = 0; j < childNode.attributes.length; ++j) {
                        let attribute = childNode.attributes.item(j);
                        simplifiedHTML += ' ' + attribute.name + '="' + attribute.value + '"';
                    }
                }
                simplifiedHTML += '>';
                simplifiedHTML += childHTML;
                simplifiedHTML += '</' + childTag + '>';
            } else {
                simplifiedHTML += childHTML;
            }
        }

        return simplifiedHTML
            .replace(/[\s\r\n]+/, ' ');
    }
}
