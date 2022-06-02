/** app libraries */
import { useEffect } from 'react'


/** my libraries */
import { Console, $$, tooltip } from '../../js/index'
import { Select } from '../../js/magic-dom'


/** libraries initializations */
Console.init()
tooltip.init()


let initialized: boolean = false

export default function Index(): JSX.Element {
    useEffect((): void => {
        if (initialized) return
        initialized = true


        $$('#dummy').append(new Select({
            options: [
                { display: 'chiemcugay', icon: 'home' },
                { display: 'damn', icon: 'home' },
                { display: 'a', icon: 'home' },
            ]
        }).onInput((value: string) => console.log(value)).component)
    }, [])


    return (
        <>
            <script src="https://kit.fontawesome.com/b0b1bbd0d1.js" crossOrigin="anonymous"></script>
            <div id="dummy"></div>
        </>
    )
}
