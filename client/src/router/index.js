import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import React from 'react'
import { hot } from 'react-hot-loader'

import App from '@/App'
import AddBookmark from '@/views/AddBookmark'

const router = () => (
  <Router>
    <Switch>
      <Route exact path="/" component={App}></Route>
      <Route path="/add-bookmark" component={AddBookmark}></Route>
    </Switch>
  </Router>
)

/* eslint-disable */
export default hot(module)(router)