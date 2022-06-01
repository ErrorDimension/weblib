import { $$ } from './jquery';
const setting = {
    initialized: false,
    init(query, { title = 'setting', description = 'change how this application behaves' } = {}) {
        if (typeof window === 'undefined' || this.initialized)
            return;
        this.initialized = true;
        const container = $$(query);
        if (!container)
            return;
        this.container = container;
    }
};
export default setting;
