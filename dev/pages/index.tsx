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
                { display: 'Alaska' },
                { display: 'Alabama' },
                { display: 'Arkansas' },
                { display: 'American Samoa' },
                { display: 'Arizona' },
                { display: 'California' },
                { display: 'Colorado' },
                { display: 'Connecticut' },
                { display: 'District of Columbia' },
                { display: 'Delaware' },
                { display: 'Florida' },
                { display: 'Georgia' },
                { display: 'Guam' },
                { display: 'Hawaii' },
                { display: 'Iowa' },
                { display: 'Idaho' },
                { display: 'Illinois' },
                { display: 'Indiana' },
                { display: 'Kansas' },
                { display: 'Kentucky' },
                { display: 'Louisiana' },
                { display: 'Massachusetts' },
                { display: 'Maryland' },
                { display: 'Maine' },
                { display: 'Michigan' },
                { display: 'Minnesota' },
                { display: 'Missouri' },
                { display: 'Mississippi' },
                { display: 'Montana' },
                { display: 'North Carolina' },
                { display: 'North Dakota' },
                { display: 'Nebraska' },
                { display: 'New Hampshire' },
                { display: 'New Jersey' },
                { display: 'New Mexico' },
                { display: 'Nevada' },
                { display: 'New York' },
                { display: 'Ohio' },
                { display: 'Oklahoma' },
                { display: 'Oregon' },
                { display: 'Pennsylvania' },
                { display: 'Puerto Rico' },
                { display: 'Rhode Island' },
                { display: 'South Carolina' },
                { display: 'South Dakota' },
                { display: 'Tennessee' },
                { display: 'Texas' },
                { display: 'Utah' },
                { display: 'Virginia' },
                { display: 'Virgin Islands' },
                { display: 'Vermont' },
                { display: 'Washington' },
                { display: 'Wisconsin' },
                { display: 'West Virginia' },
                { display: 'Wyoming' },
            ]
        }).onChange((value: string) => console.log(value)).component)
    }, [])


    return (
        <>
            <script src="https://kit.fontawesome.com/b0b1bbd0d1.js" crossOrigin="anonymous"></script>
            <div id="dummy"></div>
        </>
    )
}
