/** app libraries */
import { useEffect } from 'react'


/** my libraries */
import { Console, $$ } from '../../js/index'
import { Select } from '../../js/magic-dom'


/** libraries initializations */
Console.init()


let initialized: boolean = false

export default function Index(): JSX.Element {
    useEffect((): void => {
        if (initialized) return
        initialized = true


        $$('#dummy').append(new Select().component)
    }, [])


    return (
        <div id="dummy"></div>
    )
}
