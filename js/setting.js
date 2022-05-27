import { $$ } from './jquery';
const setting = {
    container: undefined,
    init(query) {
        this.container = $$(query);
    }
};
export default setting;
