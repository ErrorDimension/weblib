import { Component } from 'react'
import Link from 'next/link'

import magicDOM from './../../js/magic-dom'
import { $$ } from './../../js/jquery'


export default function Application() {
    return <></>
}


export class Nav extends Component {
    constructor(props) { super(props) }


    componentDidMount() {
        const { query } = this.props


        $$(query).appendChild(magicDOM.createElement('style', {
            children: `
            ${query} {
                display: flex;
                flex-direction: column;
                place-items: center;
                
                height: 100vh;
            }

            ${query} > ${query}-content {
                height: 100%;
                width: 1200px;
            }
        `}))
    }


    render() {
        const { children } = this.props

        return <nav className='nav'>{children}</nav>
    }
}


export class NavLink extends Component {
    constructor(props) { super(props) }


    render() {
        const { href, icon } = this.props

        return <Link href={href}><a>{icon}</a></Link>
    }
}


export class Setting extends Component {
    constructor(props) { super(props) }


    render() {
        const { children } = this.props

        return <div className='setting'>{children}</div>
    }
}
