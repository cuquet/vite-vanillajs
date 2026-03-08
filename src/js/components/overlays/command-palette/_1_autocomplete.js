/* --------------------------------

File#: _1_autocomplete
Title: Command Palette Autocomplete
Descr: Estat i utilitats de filtratge/navegació de resultats per al command palette.
Usage: createAutocompleteState({ items }) + normalizeAutocompleteText(value) des de _2_command-palette.js.
Dependencies:
  - None

-------------------------------- */

export const normalizeAutocompleteText = (value) =>
    String(value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();

export const createAutocompleteState = ({ items = [] } = {}) => {
    const sourceItems = Array.isArray(items) ? [...items] : [];

    const defaultItem = sourceItems.find((item) => item?.isDefault) || sourceItems[0] || null;

    let filtered = [...sourceItems];
    let activeIndex = 0;
    let autocompleteCandidate = null;

    const getActive = () => filtered[activeIndex] || null;

    const reset = () => {
        filtered = [...sourceItems];
        activeIndex = 0;
        autocompleteCandidate = null;

        return {
            filtered,
            active: getActive(),
            autocompleteCandidate,
            noMatch: filtered.length === 0,
            query: '',
        };
    };

    const filter = (rawQuery) => {
        const query = normalizeAutocompleteText(rawQuery);

        filtered = sourceItems.filter((item) => {
            const haystack = normalizeAutocompleteText(item?.searchText || item?.label || '');
            return !query || haystack.includes(query);
        });

        activeIndex = 0;
        autocompleteCandidate = query
            ? (filtered.find((item) => normalizeAutocompleteText(item?.label || '').startsWith(query)) || null)
            : null;

        return {
            filtered,
            active: getActive(),
            autocompleteCandidate,
            noMatch: filtered.length === 0,
            query,
        };
    };

    const move = (delta = 0) => {
        if (filtered.length === 0) return null;
        const step = Number.isFinite(delta) ? Number(delta) : 0;
        activeIndex = (activeIndex + step + filtered.length) % filtered.length;
        return getActive();
    };

    const setActiveById = (id) => {
        const idx = filtered.findIndex((item) => item?.id === id);
        if (idx < 0) return null;
        activeIndex = idx;
        return getActive();
    };

    return {
        filter,
        move,
        reset,
        setActiveById,
        getActive,
        getDefault: () => defaultItem,
        getFiltered: () => filtered,
        getAutocompleteCandidate: () => autocompleteCandidate,
    };
};
