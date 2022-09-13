import buttonIcon from './svg/button-icon.svg';

/**
 * Class for working with UI:
 *  - rendering base structure
 *  - show/hide preview
 *  - apply tune view
 */
export default class Ui {
    /**
     * @param {object} ui - image tool Ui module
     * @param {object} ui.api - Editor.js API
     * @param {ImageConfig} ui.config - user config
     * @param {Function} ui.onSelectFile - callback for clicks on Select file button
     * @param {boolean} ui.readOnly - read-only mode flag
     */
    constructor({api, config, onSelectFile, onRemove, readOnly}) {
        this.api = api;
        this.config = config;
        this.onSelectFile = onSelectFile;
        this.onRemove = onRemove;
        this.readOnly = readOnly;
        this.nodes = {
            wrapper: make('div', [this.CSS.baseClass, this.CSS.wrapper]),
            row: make('div', [this.CSS.row]),
            imageWrapper: make('div', [this.CSS.imageWrapper]),
            imageContainer: make('div', [this.CSS.imageContainer]),
            fileButton: this.createFileButton(),
            removeButton: this.createRemoveButton(),
            imageEl: undefined,
            imagePreloader: make('div', this.CSS.imagePreloader),
            textFieldsWrapper: make('div', [this.CSS.textFieldsWrapper]),
            text: make('div', [this.CSS.input, this.CSS.text], {
              contentEditable: !this.readOnly,
            }),
            caption: make('div', [this.CSS.input, this.CSS.caption], {
                contentEditable: !this.readOnly,
            }),
            description: make('div', [this.CSS.input, this.CSS.description], {
                contentEditable: !this.readOnly,
            }),
        };

        /**
         * Create base structure
         */
        this.nodes.text.dataset.placeholder = this.config.quotePlaceholder
        this.nodes.caption.dataset.placeholder = this.config.captionPlaceholder;
        this.nodes.description.dataset.placeholder = this.config.descriptionPlaceholder;

        this.nodes.imageContainer.appendChild(this.nodes.imagePreloader);
        this.nodes.imageWrapper.appendChild(this.nodes.imageContainer)
        this.nodes.imageWrapper.appendChild(this.nodes.fileButton);
        this.nodes.imageWrapper.appendChild(this.nodes.removeButton);
        this.nodes.row.appendChild(this.nodes.imageWrapper);
        this.nodes.textFieldsWrapper.appendChild(this.nodes.caption);
        this.nodes.textFieldsWrapper.appendChild(this.nodes.description);
        this.nodes.row.appendChild(this.nodes.textFieldsWrapper);
        this.nodes.wrapper.appendChild(this.nodes.text);
        this.nodes.wrapper.appendChild(this.nodes.row);
    }

    /**
     * CSS classes
     *
     * @returns {object}
     */
    get CSS() {
        return {
            baseClass: this.api.styles.block,
            loading: this.api.styles.loader,
            input: this.api.styles.input,
            button: this.api.styles.button,

            /**
             * Tool's classes
             */
            wrapper: 'image-tool',
            row: 'image-tool__row',
            imageWrapper: 'image-tool__image-wrapper',
            imageContainer: 'image-tool__image',
            imagePreloader: 'image-tool__image-preloader',
            imageEl: 'image-tool__image-picture',
            textFieldsWrapper: 'image-tool__text-fields-wrapper',
            text: 'image-tool__text',
            caption: 'image-tool__caption',
            description: 'image-tool__description',
            removeButton: 'image-tool__remove-button',
        };
    };

    /**
     * Ui statuses:
     * - empty
     * - uploading
     * - filled
     *
     * @returns {{EMPTY: string, UPLOADING: string, FILLED: string}}
     */
    static get status() {
        return {
            EMPTY: 'empty',
            UPLOADING: 'loading',
            FILLED: 'filled',
        };
    }

    /**
     * Renders tool UI
     *
     * @param {ImageToolData} toolData - saved tool data
     * @returns {Element}
     */
    render(toolData) {
        if (!toolData.file || Object.keys(toolData.file).length === 0) {
            this.toggleStatus(Ui.status.EMPTY);
        } else {
            this.toggleStatus(Ui.status.UPLOADING);
        }

        return this.nodes.wrapper;
    }

    /**
     * Creates upload-file button
     *
     * @returns {Element}
     */
    createFileButton() {
        const button = make('div', [this.CSS.button]);

        button.innerHTML = this.config.buttonContent || `${buttonIcon} ${this.api.i18n.t('Select an Image')}`;

        button.addEventListener('click', () => {
            this.onSelectFile();
        });

        this.api.tooltip.onHover(button, 'Click to select an image', {
            placement: 'top',
        });

        return button;
    }

    /**
     * Creates remove button
     *
     * @returns {Element}
     */
    createRemoveButton() {
        const button = make('div', [this.CSS.removeButton]);

        button.addEventListener('click', () => {
            this.onRemove();
        });

        this.api.tooltip.onHover(button, 'Remove image', {
            placement: 'top',
        });

        return button;
    }

    /**
     * Shows uploading preloader
     *
     * @param {string} src - preview source
     * @returns {void}
     */
    showPreloader(src) {
        this.nodes.imagePreloader.style.backgroundImage = `url(${src})`;

        this.toggleStatus(Ui.status.UPLOADING);
    }

    /**
     * Hide uploading preloader
     *
     * @returns {void}
     */
    hidePreloader() {
        this.nodes.imagePreloader.style.backgroundImage = '';
        this.toggleStatus(Ui.status.EMPTY);
    }

    removeImage() {
        const elements = this.nodes.wrapper.getElementsByClassName(this.CSS.imageEl);
        while(elements.length > 0){
            elements[0].parentNode.removeChild(elements[0]);
        }
        // this.toggleStatus(Ui.status.EMPTY);
    }

    /**
     * Shows an image
     *
     * @param {string} url - image source
     * @returns {void}
     */
    fillImage(url) {
        console.log('fillImage', url);
        /**
         * Check for a source extension to compose element correctly: video tag for mp4, img — for others
         */
        const tag = 'DIV';

        const attributes = {};

        /**
         * We use eventName variable because IMG and VIDEO tags have different event to be called on source load
         * - IMG: load
         * - VIDEO: loadeddata
         *
         * @type {string}
         */
        let eventName = 'load';

        /**
         * Compose tag with defined attributes
         *
         * @type {Element}
         */
        this.nodes.imageEl = make(tag, this.CSS.imageEl);
        this.nodes.imageEl.style.backgroundImage = `url(${url})`;
        /**
         * Remove previous image(s)
         *
         * @type {HTMLCollectionOf<Element>}
         */
        this.removeImage();

        const preloadedImage = new Image();

        /**
         * Add load event listener
         */
        preloadedImage.addEventListener(eventName, () => {
            this.toggleStatus(Ui.status.FILLED);

            /**
             * Preloader does not exist on first rendering with presaved data
             */
            if (this.nodes.imagePreloader) {
                this.nodes.imagePreloader.style.backgroundImage = '';
            }
        });

        preloadedImage.src = url;

        this.nodes.imageContainer.appendChild(this.nodes.imageEl);
    }

    /**
     * Shows text input
     *
     * @param {string} text - quote text
     * @returns {void}
     */
    fillText(text) {
        if (this.nodes.text) {
            this.nodes.text.innerHTML = text;
        }
    }

    /**
     * Shows caption input
     *
     * @param {string} text - caption text
     * @returns {void}
     */
    fillCaption(text) {
        if (this.nodes.caption) {
            this.nodes.caption.innerHTML = text;
        }
    }

    /**
     * Shows description input
     *
     * @param {string} text - description text
     * @returns {void}
     */
    fillDescription(text) {
        if (this.nodes.description) {
            this.nodes.description.innerHTML = text;
        }
    }

    /**
     * Changes UI status
     *
     * @param {string} status - see {@link Ui.status} constants
     * @returns {void}
     */
    toggleStatus(status) {
        for (const statusType in Ui.status) {
            if (Object.prototype.hasOwnProperty.call(Ui.status, statusType)) {
                this.nodes.wrapper.classList.toggle(`${this.CSS.wrapper}--${Ui.status[statusType]}`, status === Ui.status[statusType]);
            }
        }
    }

    /**
     * Apply visual representation of activated tune
     *
     * @param {string} tuneName - one of available tunes {@link Tunes.tunes}
     * @param {boolean} status - true for enable, false for disable
     * @returns {void}
     */
    applyTune(tuneName, status) {
        // this.nodes.wrapper.classList.toggle(`${this.CSS.wrapper}--${tuneName}`, status);
    }
}

/**
 * Helper for making Elements with attributes
 *
 * @param  {string} tagName           - new Element tag name
 * @param  {Array|string} classNames  - list or name of CSS class
 * @param  {object} attributes        - any attributes
 * @returns {Element}
 */
export const make = function make(tagName, classNames = null, attributes = {}) {
    const el = document.createElement(tagName);

    if (Array.isArray(classNames)) {
        el.classList.add(...classNames);
    } else if (classNames) {
        el.classList.add(classNames);
    }

    for (const attrName in attributes) {
        el[attrName] = attributes[attrName];
    }

    return el;
};
