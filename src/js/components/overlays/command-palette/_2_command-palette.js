/* --------------------------------

File#: _2_command-palette
Title: Command Palette
Descr: Overlay de cerca ràpida d'accions (Ctrl/Cmd+K) amb navegació per teclat i execució d'accions globals.
Descr: Les dreceres d'acció combinen Cmd/Ctrl + Shift + <tecla> per minimitzar conflictes amb navegador/SO.
Usage: Trigger via [data-cmd-palette-toggle]/commandfor="cmdPalette" i contenidor #cmdPalette amb [data-cmd-results] i #cmdInput.
Dependencies:
  - _1_autocomplete.js

-------------------------------- */

import { createAutocompleteState, normalizeAutocompleteText } from './_1_autocomplete';
import { tools as Util } from '@modules';

const CMD_PALETTE_DEFAULTS = {
    rootSelector: '#cmdPalette',
    inputSelector: '#cmdInput',
    resultsSelector: '[data-cmd-results]',
    placeholder: null,
    bodyOpenClass: 'cmd-palette-open',
    openTriggerSelector: '[data-cmd-palette-toggle], [commandfor="cmdPalette"]',
    closeTriggerSelector: '[data-cmd-palette-close]',
    items: null,
    messages: {
        noResultsTemplate: 'No results. Enter runs: {label}',
        shortcutTitleTemplate: 'Search ({shortcut})',
    },
    shortcuts: {
        openPalette: {
            key: 'k',
            requireShift: false,
            allowShift: false,
        },
        actions: {
            requireShift: true,
            allowShift: false,
            compactLabel: true,
            shiftLabelMac: '⇧',
            shiftLabelOther: 'Shift',
        },
    },
    classes: {
        item: 'cmd-palette-item',
        group: 'cmd-palette-group',
        itemDesc: 'cmd-palette-item-desc',
        shortcut: 'cmd-palette-shortcut',
        active: 'is-active',
    },
};

const DEFAULT_CMD_PALETTE_ITEMS = [
    {
        id: 'quick-search',
        group: 'Actions',
        label: 'Search',
        shortcut: 'F',
        keywords: ['search', 'find'],
        href: '/search',
        mode: 'search',
        queryParam: 'q',
        isDefault: true,
    },
];

export class CmdPalette {
    static defaults = CMD_PALETTE_DEFAULTS;
    static defaultItems = DEFAULT_CMD_PALETTE_ITEMS;

    static _isPlainObject(value) {
        return !!value && typeof value === 'object' && !Array.isArray(value);
    }

    static _getWindowOptions() {
        const winOpts = window.CMD_PALETTE_OPTIONS;
        return CmdPalette._isPlainObject(winOpts) ? winOpts : {};
    }

    static _getPlatformMeta() {
        const uaPlatform = String(navigator.userAgentData?.platform || '').toLowerCase();
        const platform = String(navigator.platform || '').toLowerCase();
        const ua = String(navigator.userAgent || '').toLowerCase();
        const fingerprint = `${uaPlatform} ${platform} ${ua}`.trim();
        const isApple = /mac|iphone|ipad|ipod/.test(fingerprint);

        return {
            isApple,
            modifierLabel: isApple ? '⌘' : 'Ctrl',
            textSeparator: isApple ? ' ' : ' + ',
            compactSeparator: '+',
        };
    }

    static _formatPrimaryShortcutLabel(key, { compact = false } = {}) {
        const platform = CmdPalette._getPlatformMeta();
        const safeKey = String(key || '').trim().toUpperCase();
        const separator = compact ? platform.compactSeparator : platform.textSeparator;

        return safeKey ? `${platform.modifierLabel}${separator}${safeKey}` : platform.modifierLabel;
    }

    static _isPrimaryShortcut(event, key, { requireShift = false, allowShift = false } = {}) {
        if (!event) return false;

        const safeKey = String(key || '').trim().toLowerCase();
        if (!safeKey) return false;

        const pressedKey = String(event.key || '').trim().toLowerCase();
        if (pressedKey !== safeKey) return false;

        if (!(event.metaKey || event.ctrlKey)) return false;
        if (event.altKey) return false;
        if (requireShift && !event.shiftKey) return false;
        if (!allowShift && !requireShift && event.shiftKey) return false;

        return true;
    }

    static _toBoolean(value, fallback = false) {
        if (value === undefined || value === null) return fallback;
        if (typeof value === 'boolean') return value;
        if (typeof value === 'number') return value !== 0;

        const normalized = String(value).trim().toLowerCase();
        if (['1', 'true', 'yes', 'on'].includes(normalized)) return true;
        if (['0', 'false', 'no', 'off'].includes(normalized)) return false;

        return fallback;
    }

    static _formatActionShortcutLabel(key, {
        compact = true,
        requireShift = true,
        shiftLabelMac = 'Shift',
        shiftLabelOther = 'Shift',
    } = {}) {
        const platform = CmdPalette._getPlatformMeta();
        const safeKey = String(key || '').trim().toUpperCase();
        if (!safeKey) return platform.modifierLabel;

        const shiftLabel = platform.isApple ? shiftLabelMac : shiftLabelOther;
        const separator = compact ? platform.compactSeparator : platform.textSeparator;
        const parts = [platform.modifierLabel];
        if (requireShift) parts.push(shiftLabel);
        parts.push(safeKey);

        return parts.join(separator);
    }

    static _normalizeKeywords(keywords) {
        if (!Array.isArray(keywords)) return '';
        return keywords.map((v) => String(v || '').trim()).filter(Boolean).join(' ');
    }

    static _normalizeItem(item, index = 0) {
        if (!item || typeof item !== 'object') return null;

        const label = String(item.label || '').trim();
        const href = String(item.href || '').trim();
        if (!label || !href) return null;

        const icon = String(item.icon || item.iconHtml || item.iconHTML || '').trim();

        const shortcut = String(item.shortcut || '').trim();
        const defaultShift = CmdPalette.defaults?.shortcuts?.actions?.requireShift ?? Boolean(shortcut);
        const shortcutRequiresShift = CmdPalette._toBoolean(
            (item.shortcutRequiresShift ?? item.shortcutShift),
            defaultShift,
        );

        return {
            id: String(item.id || `item-${index}`),
            group: String(item.group || 'Actions').trim() || 'Actions',
            label,
            icon,
            shortcut,
            shortcutRequiresShift,
            keywords: Array.isArray(item.keywords) ? item.keywords : [],
            href,
            mode: String(item.mode || '').trim(),
            queryParam: String(item.queryParam || 'q').trim() || 'q',
            isDefault: Boolean(item.isDefault),
        };
    }

    static _normalizeItems(rawItems) {
        if (!Array.isArray(rawItems)) return [];

        const normalized = rawItems
            .map((item, index) => CmdPalette._normalizeItem(item, index))
            .filter(Boolean);

        if (!normalized.length) return [];

        if (!normalized.some((item) => item.isDefault)) {
            normalized[0].isDefault = true;
        }

        return normalized;
    }

    static _buildIconNode(item) {
        const rawIcon = String(item.icon || '').trim();
        if (!rawIcon) return null;

        if (rawIcon.includes('<')) {
            const template = document.createElement('template');
            template.innerHTML = rawIcon;
            const iconNode = template.content.firstElementChild;
            if (!iconNode) return null;

            const tagName = String(iconNode.tagName || '').toLowerCase();
            if (tagName !== 'svg' && tagName !== 'i') return null;

            if (!iconNode.getAttribute('aria-hidden')) {
                Util.setAttributes(iconNode, { 'aria-hidden': 'true' });
            }
            return iconNode;
        }

        const iconNode = document.createElement('i');
        iconNode.className = rawIcon;
        Util.setAttributes(iconNode, { 'aria-hidden': 'true' });
        return iconNode;
    }

    static _runEntry(entry, query = '') {
        if (!entry) return false;

        const safeQuery = String(query || '').trim();

        if (entry.mode === 'search' && entry.href) {
            const url = new URL(entry.href, window.location.origin);
            const key = String(entry.queryParam || 'q');

            if (safeQuery) {
                url.searchParams.set(key, safeQuery);
            } else {
                url.searchParams.delete(key);
            }

            window.location.assign(`${url.pathname}${url.search}`);
            return true;
        }

        if (entry.href && entry.href !== '#0') {
            window.location.assign(entry.href);
            return true;
        }

        return false;
    }

    constructor(context = document, options = {}) {
        const runtimeOptions = CmdPalette._getWindowOptions();
        const userOptions = CmdPalette._isPlainObject(options) ? options : {};

        Object.assign(this, {
            context,
            options: Util.extend(true, CmdPalette.defaults, runtimeOptions, userOptions),
        });

        this.root = context.querySelector(this.options.rootSelector)
            || document.querySelector(this.options.rootSelector);
        if (!this.root) return;

        this.input = this.root.querySelector(this.options.inputSelector);
        this.resultsWrap = this.root.querySelector(this.options.resultsSelector);
        this.searchData = [];
        this.autocomplete = null;
        this.emptyHint = null;

        this.bound = {
            onGlobalKeydown: this.onGlobalKeydown.bind(this),
            onInput: this.onInput.bind(this),
            onInputKeydown: this.onInputKeydown.bind(this),
        };
    }

    _bindShortcutLabels() {
        const actionShortcuts = this.options.shortcuts?.actions || {};

        this.root.querySelectorAll('[data-kbd-char]').forEach((kbd) => {
            const key = String(kbd.getAttribute('data-kbd-char') || '').trim().toUpperCase();
            if (!key) return;
            const requireShift = CmdPalette._toBoolean(kbd.getAttribute('data-kbd-shift'), true);
            kbd.textContent = CmdPalette._formatActionShortcutLabel(
                key,
                {
                    compact: CmdPalette._toBoolean(actionShortcuts.compactLabel, true),
                    requireShift,
                    shiftLabelMac: String(actionShortcuts.shiftLabelMac || 'Shift'),
                    shiftLabelOther: String(actionShortcuts.shiftLabelOther || 'Shift'),
                },
            );
        });

        const titleTpl = String(this.options.messages.shortcutTitleTemplate || '').trim();
        const title = (titleTpl || 'Search ({shortcut})')
            .replace('{shortcut}', CmdPalette._formatPrimaryShortcutLabel('K', { compact: true }));

        document.querySelectorAll(this.options.openTriggerSelector).forEach((trigger) => {
            Util.setAttributes(trigger, { title });
        });
    }

    _buildEntryElement(item, index) {
        const row = document.createElement('button');
        row.className = this.options.classes.item;
        Util.setAttributes(row, {
            type: 'button',
            role: 'option',
        });
        row.dataset.cmdRowIndex = String(index);
        row.dataset.cmdItemId = String(item.id || `item-${index}`);

        const iconNode = CmdPalette._buildIconNode(item);
        if (iconNode) {
            row.appendChild(iconNode);
        }

        const label = document.createElement('span');
        label.className = this.options.classes.itemDesc;
        label.textContent = String(item.label || '');
        row.appendChild(label);

        if (item.shortcut) {
            const kbd = document.createElement('kbd');
            kbd.className = this.options.classes.shortcut;
            Util.setAttributes(kbd, {
                'data-kbd-char': String(item.shortcut),
                'data-kbd-shift': item.shortcutRequiresShift ? '1' : '0',
            });
            row.appendChild(kbd);
        }

        return row;
    }

    _renderEntriesFromItems(items) {
        if (!this.resultsWrap) return [];

        this.resultsWrap.innerHTML = '';
        Util.setAttributes(this.resultsWrap, { role: 'listbox' });

        const entries = [];
        const seenGroups = new Set();

        items.forEach((item, index) => {
            const groupName = String(item.group || 'Actions');
            if (!seenGroups.has(groupName)) {
                seenGroups.add(groupName);
                const heading = document.createElement('div');
                heading.className = this.options.classes.group;
                heading.textContent = groupName;
                this.resultsWrap.appendChild(heading);
            }

            const row = this._buildEntryElement(item, index);
            this.resultsWrap.appendChild(row);

            entries.push({
                id: String(item.id || `item-${index}`),
                element: row,
                label: String(item.label || ''),
                searchText: normalizeAutocompleteText(
                    `${item.label || ''} ${CmdPalette._normalizeKeywords(item.keywords)}`,
                ),
                href: String(item.href || ''),
                mode: String(item.mode || ''),
                queryParam: String(item.queryParam || 'q'),
                shortcut: String(item.shortcut || '').trim().toUpperCase(),
                shortcutRequiresShift: Boolean(item.shortcutRequiresShift),
                isDefault: Boolean(item.isDefault),
            });
        });

        return entries;
    }

    _resolveItems() {
        const fromOptions = CmdPalette._normalizeItems(this.options.items);
        if (fromOptions.length) return fromOptions;

        const fromWindow = CmdPalette._normalizeItems(window.CMD_PALETTE_ITEMS);
        if (fromWindow.length) return fromWindow;

        return CmdPalette._normalizeItems(CmdPalette.defaultItems);
    }

    _formatNoResults(defaultLabel) {
        const template = String(this.options.messages.noResultsTemplate || '').trim();
        const fallback = 'No results. Enter runs: {label}';
        const safeLabel = String(defaultLabel || '').trim();

        return (template || fallback)
            .replace('{label}', safeLabel || 'Search');
    }

    _ensureEmptyHint() {
        if (!this.resultsWrap) return null;

        let emptyHint = this.root.querySelector('[data-cmd-empty-hint]');
        if (!emptyHint) {
            emptyHint = document.createElement('div');
            emptyHint.className = this.options.classes.group;
            emptyHint.dataset.cmdEmptyHint = '1';
            emptyHint.hidden = true;
            this.resultsWrap.appendChild(emptyHint);
        }

        this.emptyHint = emptyHint;
        return emptyHint;
    }

    _renderActive() {
        const active = this.autocomplete?.getActive();

        this.searchData.forEach((item) => {
            const isActive = !!active && active.id === item.id;
            Util.toggleClass(item.element, this.options.classes.active, isActive);
            Util.setAttributes(item.element, { 'aria-selected': isActive ? 'true' : 'false' });
        });

        if (active?.element) active.element.scrollIntoView({ block: 'nearest' });
    }

    _clearVisualState() {
        this.searchData.forEach((item) => {
            Util.removeClass(item.element, this.options.classes.active);
            item.element.hidden = false;
            Util.setAttributes(item.element, { 'aria-selected': 'false' });
        });
    }

    _showMatches(rawQuery) {
        const state = this.autocomplete.filter(rawQuery);
        const visibleIds = new Set(state.filtered.map((item) => item.id));

        this.searchData.forEach((item) => {
            item.element.hidden = !visibleIds.has(item.id);
            Util.removeClass(item.element, this.options.classes.active);
            Util.setAttributes(item.element, { 'aria-selected': 'false' });
        });

        if (state.noMatch) {
            if (this.emptyHint && this.autocomplete.getDefault()) {
                this.emptyHint.hidden = false;
                this.emptyHint.textContent = this._formatNoResults(this.autocomplete.getDefault().label);
            }
            return;
        }

        if (this.emptyHint) this.emptyHint.hidden = true;
        this._renderActive();
    }

    open() {
        this.root.hidden = false;
        Util.setAttributes(this.root, { 'aria-hidden': 'false' });
        Util.addClass(document.body, this.options.bodyOpenClass);

        this.autocomplete.reset();
        this._clearVisualState();
        if (this.emptyHint) this.emptyHint.hidden = true;
        this._renderActive();

        setTimeout(() => this.input?.focus(), 30);
    }

    close() {
        if (this.root.hidden) return;

        this.root.hidden = true;
        Util.setAttributes(this.root, { 'aria-hidden': 'true' });
        Util.removeClass(document.body, this.options.bodyOpenClass);

        if (this.input) this.input.value = '';
        this.autocomplete.reset();
        if (this.emptyHint) this.emptyHint.hidden = true;
        this._clearVisualState();
    }

    toggle() {
        if (this.root.hidden) this.open();
        else this.close();
    }

    execute(entry) {
        if (CmdPalette._runEntry(entry, this.input?.value || '')) {
            this.close();
            return true;
        }

        return false;
    }

    _findGlobalShortcutEntry(event) {
        if (!event) return null;
        const actionShortcuts = this.options.shortcuts?.actions || {};
        const defaultRequireShift = CmdPalette._toBoolean(actionShortcuts.requireShift, true);
        const defaultAllowShift = CmdPalette._toBoolean(actionShortcuts.allowShift, false);

        for (const entry of this.searchData) {
            const key = String(entry.shortcut || '').trim();
            if (!key) continue;

            const requireShift = entry.shortcutRequiresShift ?? defaultRequireShift;
            if (CmdPalette._isPrimaryShortcut(
                event,
                key,
                { requireShift: Boolean(requireShift), allowShift: defaultAllowShift },
            )) {
                return entry;
            }
        }

        return null;
    }

    onGlobalKeydown(event) {
        const openShortcut = this.options.shortcuts?.openPalette || {};
        const openKey = String(openShortcut.key || 'k');
        const openRequireShift = CmdPalette._toBoolean(openShortcut.requireShift, false);
        const openAllowShift = CmdPalette._toBoolean(openShortcut.allowShift, false);

        if (CmdPalette._isPrimaryShortcut(
            event,
            openKey,
            { requireShift: openRequireShift, allowShift: openAllowShift },
        )) {
            event.preventDefault();
            this.toggle();
            return;
        }

        const shortcutEntry = this._findGlobalShortcutEntry(event);
        if (shortcutEntry) {
            event.preventDefault();
            this.execute(shortcutEntry);
            return;
        }

        if (event.key === 'Escape' && !this.root.hidden) {
            event.preventDefault();
            this.close();
        }
    }

    onInput() {
        this._showMatches(this.input?.value || '');
    }

    onInputKeydown(event) {
        if (this.root.hidden) return;

        if (event.key === 'ArrowDown') {
            event.preventDefault();
            if (this.autocomplete.move(1)) this._renderActive();
            return;
        }

        if (event.key === 'ArrowUp') {
            event.preventDefault();
            if (this.autocomplete.move(-1)) this._renderActive();
            return;
        }

        if (event.key === 'Tab' && (this.input?.value || '').trim()) {
            const candidate = this.autocomplete.getAutocompleteCandidate();
            if (!candidate) return;
            event.preventDefault();
            this.input.value = candidate.label;
            this._showMatches(this.input.value);
            return;
        }

        if (event.key === 'Enter') {
            event.preventDefault();
            const entry = this.autocomplete.getActive() || this.autocomplete.getDefault();
            this.execute(entry);
        }
    }

    _bindRows() {
        this.searchData.forEach((item) => {
            item.element.addEventListener('mouseenter', () => {
                if (!this.autocomplete.setActiveById(item.id)) return;
                this._renderActive();
            });

            item.element.addEventListener('click', (event) => {
                event.preventDefault();
                this.execute(item);
            });
        });
    }

    _bindTriggers() {
        document.querySelectorAll(this.options.openTriggerSelector).forEach((trigger) => {
            if (trigger.dataset.cmdPaletteToggleBound === '1') return;
            trigger.dataset.cmdPaletteToggleBound = '1';
            trigger.addEventListener('click', (event) => {
                event.preventDefault();
                this.toggle();
            });
        });

        this.root.querySelectorAll(this.options.closeTriggerSelector).forEach((btn) => {
            if (btn.dataset.cmdPaletteCloseBound === '1') return;
            btn.dataset.cmdPaletteCloseBound = '1';
            btn.addEventListener('click', (event) => {
                event.preventDefault();
                this.close();
            });
        });
    }

    init() {
        if (!this.root || this.root.dataset.cmdPaletteInitialized === '1') return;
        if (!this.resultsWrap) return;

        const cmdItems = this._resolveItems();
        if (!cmdItems.length) return;

        this.searchData = this._renderEntriesFromItems(cmdItems);
        this.autocomplete = createAutocompleteState({ items: this.searchData });

        this._bindShortcutLabels();

        if (this.input) {
            if (typeof this.options.placeholder === 'string' && this.options.placeholder.trim()) {
                this.input.placeholder = this.options.placeholder;
            }
            Util.setAttributes(this.input, {
                autocomplete: 'off',
                autocorrect: 'off',
                autocapitalize: 'off',
                spellcheck: 'false',
            });
        }

        this._ensureEmptyHint();
        this._bindTriggers();
        this._bindRows();

        document.addEventListener('keydown', this.bound.onGlobalKeydown);
        if (this.input) {
            this.input.addEventListener('input', this.bound.onInput);
            this.input.addEventListener('keydown', this.bound.onInputKeydown);
        }

        this.root.dataset.cmdPaletteInitialized = '1';
    }
}

export const initCommandPalette = (context = document, options = {}) => {
    const root = context.querySelector(CmdPalette.defaults.rootSelector)
        || document.querySelector(CmdPalette.defaults.rootSelector);
    if (!root) return null;

    if (root.__cmdPaletteInstance) {
        return root.__cmdPaletteInstance;
    }

    const instance = new CmdPalette(context, options);
    instance.init();

    if (instance?.root) {
        instance.root.__cmdPaletteInstance = instance;
    }

    return instance;
};
