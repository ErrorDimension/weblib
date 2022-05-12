import { Component } from 'react'


export default class App extends Component {
    constructor(props) {
        super(props)
    }


    render() {
        const { children } = this.props

        return (<>{children}</>)
    }
}


export class Nav extends Component {
    constructor(props) {
        super(props)
    }


    render() {
        const { children } = this.props

        return (
            <nav className="nav">
                {children}
            </nav>
        )
    }
}


export class Setting extends Component {
    constructor(props) {
        super(props)
    }


    componentDidMount() { }


    render() {
        const { children } = this.props

        return (
            <div className="setting">
                {children}
            </div>
        )
    }
}
