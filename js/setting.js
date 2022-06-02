import { $$ } from './jquery';
const setting = {
    initialized: false,
    container: undefined,
    init(query, { title = 'setting', description = 'change how this application behaves' } = {}) {
        if (typeof window === 'undefined' || this.initialized)
            return;
        this.initialized = true;
        let con = $$(query);
        if (!con)
            return;
        this.container = con;
    }
};
export default setting;
