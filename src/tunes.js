import { make } from './ui';
import bgIcon from './svg/background.svg';
import borderIcon from './svg/border.svg';
import stretchedIcon from './svg/stretched.svg';

/**
 * Working with Block Tunes
 */
export default class Tunes {
  /**
   * @param {object} tune - image tool Tunes managers
   * @param {object} tune.api - Editor API
   * @param {object} tune.layouts - list of user defined tunes
   * @param {Function} tune.onChange - tune toggling callback
   */
  constructor({ api, layouts, onChange }) {
    this.api = api;
    this.layouts = layouts;
    this.onChange = onChange;
    this.buttons = [];
  }

  /**
   * Available Image tunes
   *
   * @returns {{name: string, icon: string, title: string}[]}
   */
  static get tunes() {
    return [
    ];
  }

  /**
   * Styles
   *
   * @returns {{wrapper: string, buttonBase: *, button: string, buttonActive: *}}
   */
  get CSS() {
    return {
      wrapper: '',
      buttonBase: this.api.styles.settingsButton,
      button: 'image-tool__tune',
      buttonActive: this.api.styles.settingsButtonActive,
    };
  }

  /**
   * Makes buttons with tunes: add background, add border, stretch image
   *
   * @param {ImageToolData} toolData - generate Elements of tunes
   * @returns {Element}
   */
  render(toolData) {
    const wrapper = make('div', this.CSS.wrapper);
    const currentLayout = toolData.layout || 'default';

    this.buttons = [];

    const tunes = Tunes.tunes.concat(this.layouts);

    tunes.forEach(tune => {
      const title = this.api.i18n.t(tune.title);
      const el = make('div', [this.CSS.buttonBase, this.CSS.button], {
        innerHTML: tune.icon,
        title,
      });

      el.addEventListener('click', () => {
        console.log('tune click', tune.name);
        this.tuneClicked(tune.name);
      });

      el.dataset.tuneType = 'layout';
      el.dataset.tune = tune.name;
      el.classList.toggle(this.CSS.buttonActive, currentLayout === tune.name);

      this.buttons.push(el);

      this.api.tooltip.onHover(el, title, {
        placement: 'top',
      });

      wrapper.appendChild(el);
    });

    return wrapper;
  }

  /**
   * Clicks to one of the tunes
   *
   * @param {string} tuneName - clicked tune name
   */
  tuneClicked(tuneName) {

    const buttons = this.buttons.filter(el => el.dataset.tuneType === 'layout');
    buttons.forEach(button => {
      button.classList.toggle(this.CSS.buttonActive, button.dataset.tune === tuneName);
    });

    this.onChange(tuneName);
  }
}
