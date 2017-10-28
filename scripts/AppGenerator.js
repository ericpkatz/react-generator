class AppGenerator{
  static Component(model){
    return `
      const ${pluralize(model.name)} = () => {
        return (
          <div className='well'>
            ${ pluralize(model.name) }
          </div>
        );
      };
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
  static scripts(){
    const script = 'script';
    return `
<${script} src='https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js'></${script}>
<${script} src="https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/6.26.0/babel.js"></${script}>
<${script} crossorigin src="https://unpkg.com/react@15/dist/react.js"></${script}>
<${script} crossorigin src="https://unpkg.com/react-dom@15/dist/react-dom.js"></${script}>
<${script} src='https://cdnjs.cloudflare.com/ajax/libs/react-router/4.2.0/react-router.js'></${script}>
<${script} src='https://cdnjs.cloudflare.com/ajax/libs/react-router-dom/4.2.2/react-router-dom.min.js'></${script}>
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
    ${AppGenerator.Nav( models )}
    ${AppGenerator.Components( models )}


    const root = document.getElementById('root');
    ReactDOM.render((
<Router>
<div>
${ AppGenerator.Routes(models)}
</div>
</Router>
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
