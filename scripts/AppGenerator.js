class AppGenerator{
  static Dispatch(models){
    return `
    const mapDispatchToProps = (dispatch)=> {
      return {
        init: ()=> {
          ${ models.reduce( (memo, model) => {
            if(model.fetchOnMount){
              memo.push(`dispatch(fetch${pluralize(model.name)}());`);
            }
            return memo;

          }, []).join('') }
        }
      };
    };
    `;
  }
  static Comment(comment){
    return `
    /*********************
     * ${comment}
     *********************/
    `;
  }
  static State(models){
    const injectedState = models.reduce((memo, model)=> {
      if(model.fetchOnMount){
        memo.push(pluralize(model.name));
      }
      return memo;
    }, []);
    return `
    const mapStateToProps = ({ ${ injectedState.join(', ')} })=> {
      return {
        ${ injectedState.join(',') }
      };
    };
    `;
  }
  static Component(model){
    const pluralized = pluralize(model.name); 
    return `
      ${AppGenerator.Comment( `SET UP COMPONENT ${pluralized}` )}
      const _${pluralize(model.name)} = ({${ pluralize(model.name) }}) => {
        return (
          <div className='well'>
            ${ pluralize(model.name) }
            ({ ${ pluralize(model.name) }.length}) 
            {
              ${pluralize(model.name)}.map( (item, idx) => {
                
                return (
                  <li key={ idx }>
                    ${ model.attr.map( att => {
                      return `{item.${att.name}}`;
                    }).join(' ')}
                  </li>
                );
              })
            }
          </div>
        );
      };
      const ${pluralize(model.name)}Mapper = ({${pluralize(model.name)}})=> {
        return {
          ${pluralize(model.name)}
        };
      };
      const ${pluralize(model.name)} = connect(${pluralize(model.name)}Mapper)(_${pluralize(model.name)}); 

      ${AppGenerator.Comment( `Action Creator for ${pluralized}` )}
      const fetch${pluralize(model.name)} = ()=> {
        return (dispatch)=> {
          ${AppGenerator.Comment(`Hook into API to load ${pluralized}` )}
          const data = ${ JSON.stringify( model.initialData )};
          dispatch({
            type: 'SET_${pluralize(model.name)}',
            data
          });
        };
      };
    `;
  }
  static Components(config){
    const { models, name } = config;
    return `
      ${ models.map( model => AppGenerator.Component(model)).join('') }
      const Home = ()=> {
        return (
          <div className='well'>
            Home
          </div>
        );
      };

      const Title = ()=> {
        return (
          <h2>${ name }</h2>
        );
      };
    `;
  }
  static Route(model){
    return `
      <Route path='/${pluralize(model.name)}' component={${ pluralize(model.name) }} />`;
  }
  static Routes(models){
    const injectedState = models.reduce((memo, model)=> {
      const pluralizedModel = pluralize(model.name); 
      if(model.fetchOnMount){
        memo.push(`${pluralizedModel}={this.props.${ pluralizedModel }}`);
      }
      return memo;
    }, []);
    return `
      <Route component={ Title } />
      <Route render={ ({ location } )=> <Nav location={ location } ${ injectedState.join(' ') }/> } />
      <Route path='/' exact component={ Home } />
      ${ models.map( model => AppGenerator.Route(model)).join('') }`;
  }
  static Nav(models){
    const injectedState = models.reduce((memo, model)=> {
      const pluralizedModel = pluralize(model.name); 
      if(model.fetchOnMount){
        memo.push(pluralizedModel);
      }
      return memo;
    }, []);
    return `
      const Nav = ({ location, ${injectedState.join(', ')} })=> {
          const isSelected = (pathname, startsWith)=> {
            return pathname === location.pathname || ( startsWith && location.pathname.indexOf(pathname) === 0 );

          };
          return ( 
          <ul style={{ marginBottom: '10px'}} className='nav nav-tabs'>
            <li className={ isSelected('/') ? 'active' : '' }>
              <Link to='/'>Home</Link>
            </li>
            ${ models.map( model => {
              const pluralized = pluralize(model.name);
              return (
                `
                <li className={ isSelected('/${ pluralize( model.name )}', true) ? 'active' : '' }>
                    <Link to='/${ pluralize(model.name) }'>
                      ${ pluralized }
                      {
                        Array.isArray(${ pluralized }) && (
                          <span className='badge'>{ ${ pluralized}.length }</span>
                        ) 
                      }
                    </Link>
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
            switch(action.type){
              case 'SET_${pluralize(model.name)}':
                state = action.data;
                break;
            }
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
<${script} src='https://cdn.jsdelivr.net/npm/redux-logger@3.0.6/dist/redux-logger.min.js'></${script}>
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
    const { Component } = React;
    const Router = HashRouter;
    const { Provider, connect } = ReactRedux;

    const { createStore, combineReducers, applyMiddleware } = Redux;
    const { createLogger } = reduxLogger;

    ${AppGenerator.Comment( 'SET UP STORE' )}

    const store = createStore(combineReducers(
      ${ AppGenerator.reducers(models) }
    ), applyMiddleware(createLogger({})), applyMiddleware(ReduxThunk.default));

    ${AppGenerator.Comment( 'SET UP NAV' )}
    ${AppGenerator.Nav( models )}
    ${AppGenerator.Comment( 'SET UP COMPONENTS' )}
    ${AppGenerator.Components( app )}

    ${AppGenerator.Comment( 'SET UP ROUTES' )}

    class _Routes extends Component{
      componentDidMount(){
        this.props.init();
      }
      render(){
        return (<Router><div className='container'>${ AppGenerator.Routes(models)}</div></Router>);
      }
    };

    ${ AppGenerator.State(models) }

    ${ AppGenerator.Dispatch(models) }

    const Routes = connect(mapStateToProps, mapDispatchToProps)(_Routes);

    ${AppGenerator.Comment( 'SET UP App' )}

    const App = ()=> {
      return (
        <Provider store={ store }><Routes /></Provider>
      );
    };


    const root = document.getElementById('root');
    ReactDOM.render(<App />, root);
  </${script}>
</html>
    `;
const preview = html.replace(/</g, "&lt;");
$('#codePreview').html(preview);
iframe.attr(
"src", "data:text/html;charset=utf-8," + 
html
);
    hljs.initHighlightingOnLoad();
  }
}
