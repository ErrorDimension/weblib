import { $$ } from './jquery';
const setting = {
    container: undefined,
    init(query, { title = 'setting', description = 'change how this application behaves' } = {}) {
        if (typeof window === 'undefined' || this.initialized)
            return;
        this.initialized = true;
        this.container = $$(query);
    }
};
export default setting;
