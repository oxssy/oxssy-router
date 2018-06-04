import React, {cloneElement, Children, Component, createElement} from 'react';
import {render} from 'react-dom'
import createHistory from 'history/createBrowserHistory';
import toRegex from 'path-to-regexp';
import queryString from 'query-string';
import randomKey from 'random-key';
import PropTypes from 'prop-types';

const history = createHistory();
const routes = {};

const resolveRoute = () => {
  Object.values(routes).forEach(route => route.forceUpdate());
};

history.listen(resolveRoute);


class Route extends Component {
  constructor(props) {
    super(props);
    this.params = [];
    this.route = toRegex(props.route, this.params, props.options);
    this.key = randomKey.generate();
    this.state = {isMatch: false, params: {}, query: {}};
  }

  componentWillMount() {
    routes[this.key] = this;
  }

  componentWillUnmount() {
    if (routes[this.key]) {
      delete routes[this.key];
    }
  }

  render() {
    const {pathname, search} = window.location;
    const match = this.route.exec(pathname);
    const isMatch = !!match ^ !!this.props.unmatch;
    if (!isMatch) {
      return null;
    }
    const params = {};
    match.forEach((element, index) => {
      if (index > 0) {
        params[this.params[index - 1].name] = element;
      }
    });
    const query = queryString.parse(search);
    return cloneElement(Children.only(this.props.children), {params, query});
  }

}

const onLinkClick = (event) => {
  event.preventDefault();
  if (event.currentTarget.pathname) {
    if (event.ctrlKey || event.metaKey) {
      window.open(event.currentTarget.href, '_blank');
    } else if (event.currentTarget.host && event.currentTarget.host !== window.location.host) {
      window.location = event.currentTarget.href;
    } else if (event.currentTarget.href !== window.location.href) {
      setLocation(event.currentTarget.pathname, event.currentTarget.search);
    }
  }
};

const setLocation = (pathname, search = '') => {
  history.push({pathname, search : typeof search === 'string'? search : queryString.stringify(search)});
};

const Link = (props) => {
  const {component, ...rest} = props;
  return createElement(component || 'a', {onClick: onLinkClick, ...rest}, rest.children);
};

export {Route, setLocation, Link};
