class AppGenerator{
  static Component(model){
    return `
      const _${pluralize(model.name)} = ({${ pluralize(model.name) }}) => {
        return (
          <div className='well'>
            ${ pluralize(model.name) }
            ({ ${ pluralize(model.name) }.length}) 
          </div>
        );
      };
      const ${pluralize(model.name)}Mapper = ({${pluralize(model.name)}})=> {
        return {
          ${pluralize(model.name)}
        };
      };
      const ${pluralize(model.name)} = connect(${pluralize(model.name)}Mapper)(_${pluralize(model.name)}); 
    `;
  }
  static Components(models){
    return `
      ${ models.map( model => AppGenerator.Component(model)).join('') }
      const Home = ()=> {
        return (
          <div className='well'>
            Home
          </div>
        );
      };
    `;
  }
  static Route(model){
    return `
      <Route path='/${pluralize(model.name)}' component={${ pluralize(model.name) }} />
    `;
  }
  static Routes(models){
    return `
      <Route component={ Nav } />
      <Route path='/' exact component={ Home } />
      ${ models.map( model => AppGenerator.Route(model)).join('') }
    `;
  }
  static Nav(models){
    return `
      const Nav = ({ location })=> {
          const isSelected = (pathname, startsWith)=> {
            return pathname === location.pathname || ( startsWith && location.pathname.indexOf(pathname) === 0 );

          };
          return ( 
          <ul className='nav nav-tabs'>
            <li className={ isSelected('/') ? 'active' : '' }>
              <Link to='/'>Home</Link>
            </li>
            ${ models.map( model => {
              return (
                `
                <li className={ isSelected('/${ pluralize( model.name )}', true) ? 'active' : '' }>
                    <Link to='/${ pluralize(model.name) }'>${ pluralize(model.name) }</Link>
                  </li>
                `
              );
            }).join('')}
          </ul>
        );
      };
    `;
  }
  static reducers(models){
    return `{
      ${ models.map( model => {
        return `
          ${pluralize(model.name)}: (state = [], action)=> {
            return state;
          }
        `
      }) }
      }`;
  }
  static scripts(){
    const script = 'script';
    return `
<${script} src='https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js'></${script}>
<${script} src="https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/6.26.0/babel.js"></${script}>
<${script} crossorigin src="https://unpkg.com/react@15/dist/react.js"></${script}>
<${script} crossorigin src="https://unpkg.com/react-dom@15/dist/react-dom.js"></${script}>
<${script} src='https://cdnjs.cloudflare.com/ajax/libs/react-router/4.2.0/react-router.js'></${script}>
<${script} src='https://cdnjs.cloudflare.com/ajax/libs/react-router-dom/4.2.2/react-router-dom.min.js'></${script}>
<${script} src='https://cdnjs.cloudflare.com/ajax/libs/redux/3.7.2/redux.js'></${script}>
<${script} src='https://cdnjs.cloudflare.com/ajax/libs/react-redux/5.0.6/react-redux.js'></${script}>
<${script} src='https://cdnjs.cloudflare.com/ajax/libs/redux-thunk/2.2.0/redux-thunk.js'></${script}>
<link href='https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css' rel='stylesheet' />
`;

  }
  static generate(str){
    const script = 'script';
    const app = JSON.parse(decodeURIComponent(str));
    const { name, models } = app;
    const iframe = $('#appFrame');
    const html = `
<html> 
  <head>
    ${AppGenerator.scripts()}
  </head>
  <body>
    <div id='root'></div>
  </body>
  <${script} type='text/babel'>
    const { Link, HashRouter, Route, Switch } = ReactRouterDOM;
    const Router = HashRouter;
    const { Provider, connect } = ReactRedux;
    const { createStore, combineReducers } = Redux;

    const store = createStore(combineReducers(
      ${ AppGenerator.reducers(models) }
    ));
    ${AppGenerator.Nav( models )}
    ${AppGenerator.Components( models )}


    const root = document.getElementById('root');
    ReactDOM.render((
<Provider store={ store }>
<Router>
<div>
${ AppGenerator.Routes(models)}
</div>
</Router>
</Provider>
), root);
  </${script}>
</html>
    `;
const preview = html.replace(/</g, "&lt;");
$('#codePreview').html(preview);
iframe.attr(
"src", "data:text/html;charset=utf-8," + 
html
);
  }
}
