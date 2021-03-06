import { $$ } from './jquery'


const setting: {
    initialized: boolean
    container?: HTMLElement,
    init(query: string, { title, description }?: {
        title?: string,
        description?: string
    }): void
} = {
    initialized: false,


    init(query: string, {
        title = 'setting',
        description = 'change how this application behaves'
    }: {
        title?: string,
        description?: string
    } = {}): void {
        if (typeof window === 'undefined' || this.initialized) return
        this.initialized = true


        let con: HTMLElement | null = $$(query)
        if (!con) return

        this.container = con
    }
}


export default setting
