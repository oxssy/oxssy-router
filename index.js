import { cloneElement, Children, Component, createElement } from 'react';
import createHistory from 'history/createBrowserHistory';
import toRegex from 'path-to-regexp';
import { parse, stringify } from 'querystring';


let history;
let routes;

const routerInit = () => {
  history = createHistory();
  routes = new Set();
  history.listen(() => routes.forEach(route => route.forceUpdate()));
};

class Route extends Component {
  constructor(props) {
    super(props);
    const { route, option } = props;
    this.params = [];
    this.route = toRegex(route, this.params, option);
  }

  componentWillMount() {
    routes.add(this);
  }

  componentWillUnmount() {
    if (routes.has(this)) {
      routes.delete(this);
    }
  }

  render() {
    const { children, unmatch } = this.props;
    const { pathname, search } = window.location;
    const match = this.route.exec(pathname);
    const isMatch = !!match ^ !!unmatch;
    if (!isMatch) {
      return null;
    }
    const params = {};
    match.forEach((element, index) => {
      if (index > 0) {
        params[this.params[index - 1].name] = element;
      }
    });
    const query = parse(search);
    return cloneElement(Children.only(children), { params, query });
  }
}

const setLocation = (pathname, search = '') => {
  history.push({
    pathname,
    search: typeof search === 'string' ? search : stringify(search),
  });
};

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

const Link = (props) => {
  const { component, ...rest } = props;
  return createElement(component || 'a', { onClick: onLinkClick, ...rest }, rest.children);
};

export { Route, routerInit, setLocation, Link };
