import { $$ } from './jquery'


const setting: {
    container?: HTMLElement,
    init(query: string): void
} = {
    container: undefined,


    init(query: string): void {
        this.container = $$(query)
    }
}


export default setting
