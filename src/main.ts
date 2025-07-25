import { EditorView } from '@codemirror/view';
import escapeStringRegexp from 'escape-string-regexp';
import { Events, MarkdownView, Plugin, debounce } from 'obsidian';

import { calloutExtension, calloutsConfigField, setConfig } from './extension';
import { buildPostProcessor } from './postProcessor';
import {
  Callout,
  CalloutConfig,
  ListCalloutSettings,
  ListCalloutsSettings,
} from './settings';

const DEFAULT_SETTINGS: ListCalloutsSettings = [
  {
    color: '255, 23, 68',
    tag: '!',
  },
  {
    color: '255, 145, 0',
    tag: '?',
  },
  {
    color: '0, 200, 83',
    tag: '$',
  },
  {
    color: '124, 77, 255',
    tag: '~',
  },
  {
    color: '0, 184, 212',
    tag: 'note',
  },
];

export default class ListCalloutsPlugin extends Plugin {
  settings: ListCalloutsSettings;
  emitter: Events;
  postProcessorConfig: CalloutConfig;

  async onload() {
    await this.loadSettings();
    this.buildPostProcessorConfig();
    this.addSettingTab(new ListCalloutSettings(this));

    this.emitter = new Events();

    this.registerMarkdownPostProcessor(
      buildPostProcessor(() => this.postProcessorConfig),
      10000
    );

    this.registerEditorExtension([
      calloutsConfigField.init(() => {
        return this.buildEditorConfig();
      }),
      calloutExtension,
    ]);

    app.workspace.trigger('parse-style-settings');
  }

  emitSettingsUpdate = debounce(() => this.dispatchUpdate(), 2000, true);

  dispatchUpdate() {
    const newConfig = this.buildEditorConfig();

    app.workspace.getLeavesOfType('markdown').find((l) => {
      const view = l.view as MarkdownView;
      const cm = (view.editor as any).cm as EditorView;

      cm?.dispatch({
        effects: [setConfig.of(newConfig)],
      });
    });
  }

  buildEditorConfig(): CalloutConfig {
    return {
      callouts: this.settings.reduce<Record<string, Callout>>((record, curr) => {
        record[curr.tag] = curr;
        return record
      }, {}),
      re: new RegExp(
        `(^\\s*[-*+](?: \\[.\\])? |^\\s*\\d+[\\.\\)](?: \\[.\\])? ).*?#(${
          this.settings.map(callout => escapeStringRegexp(callout.tag)).join('|')
        })(?:\\s|$)`
      ),
    }
  }

  buildPostProcessorConfig() {
    this.postProcessorConfig = {
      callouts: this.settings.reduce<Record<string, Callout>>((record, curr) => {
        record[curr.tag] = curr;
        return record
      }, {}),
      re: new RegExp(
        `#(${
          this.settings.map(callout => escapeStringRegexp(callout.tag)).join('|')
        })(?:\\s|$)`
      ),
    }
  }

  async loadSettings() {
    const loadedSettings = (await this.loadData()) as Callout[];
    
    // Если есть сохраненные настройки, используем их, иначе используем дефолтные
    this.settings = loadedSettings && loadedSettings.length > 0 ? loadedSettings : DEFAULT_SETTINGS;
  }

  async saveSettings() {
    await this.saveData(this.settings);
    this.emitSettingsUpdate();
    this.buildPostProcessorConfig();
  }
}
