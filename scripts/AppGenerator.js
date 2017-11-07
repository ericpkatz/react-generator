class AppGenerator{
  static CamelCase(str){
    return `${str.slice(0,1).toLowerCase()}${str.slice(1)}`;
  }
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
      memo.push(AppGenerator.CamelCase(pluralize(model.name)));
      return memo;
    }, []);
    injectedState.push('user');
    return `
    const mapStateToProps = ({ ${ injectedState.join(', ')} })=> {
      return {
        ${ injectedState.join(',') }
      };
    };
    `;
  }
  static Component(model){
    model.attr = model.attr || [];
    const pluralized = pluralize(model.name); 
    return `
      ${AppGenerator.Comment( `SET UP COMPONENT ${pluralized}` )}
      const _${pluralize(model.name)} = ({${ AppGenerator.CamelCase(pluralize(model.name)) }}) => {
        return (
          <div className='well'>
            ${ pluralize(model.name) }
            ({ ${ pluralize(model.name) }.length}) 
            {
              ${AppGenerator.CamelCase(pluralize(model.name))}.map( (item, idx) => {
                
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
      const ${AppGenerator.CamelCase(pluralize(model.name))}Mapper = ({${AppGenerator.CamelCase(pluralize(model.name))}})=> {
        return {
          ${AppGenerator.CamelCase(pluralize(model.name))}
        };
      };
      const ${pluralize(model.name)} = connect(${AppGenerator.CamelCase(pluralize(model.name))}Mapper)(_${pluralize(model.name)}); 

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
      <Route path='/${AppGenerator.CamelCase(pluralize(model.name))}' component={${ pluralize(model.name) }} />`;
  }
  static Routes(models){
    const injectedState = models.reduce((memo, model)=> {
      const pluralizedModel = pluralize(model.name); 
        memo.push(`${AppGenerator.CamelCase(pluralizedModel)}={this.props.${ AppGenerator.CamelCase(pluralizedModel) }}`);
      return memo;
    }, []);
    injectedState.push('user={ this.props.user }');
    return `
      <Route component={ Title } />
      <Route render={ ({ location } )=> <Nav location={ location } ${ injectedState.join(' ') }/> } />
      <Route path='/' exact component={ Home } />
      ${ models.map( model => AppGenerator.Route(model)).join('') }`;
  }
  static Nav(models){
    const injectedState = models.reduce((memo, model)=> {
      const pluralizedModel = pluralize(model.name); 
      memo.push(AppGenerator.CamelCase(pluralizedModel));
      return memo;
    }, []);
    injectedState.push('user');
    return `
      const _Nav = ({ location, attemptLogin, logout, ${injectedState.join(', ')} })=> {
          const isSelected = (pathname, startsWith)=> {
            return pathname === location.pathname || ( startsWith && location.pathname.indexOf(pathname) === 0 );

          };
          const isLoggedIn = !!user.id;
          return ( 
          <div style={{ marginBottom: '10px'}}>
          <ul className='nav nav-tabs' style={{ marginBottom: '10px'}}>
            <li className={ isSelected('/') ? 'active' : '' }>
              <Link to='/'>Home</Link>
            </li>
            ${ models.map( model => {
              const pluralized = pluralize(model.name);
              return (
                `
                <li className={ isSelected('/${ AppGenerator.CamelCase(pluralize( model.name ))}', true) ? 'active' : '' }>
                    <Link to='/${ AppGenerator.CamelCase(pluralize(model.name)) }'>
                      ${ pluralized }
                      {
                        ${ AppGenerator.CamelCase(pluralized) } && (
                          <span className='badge'>{ ${ AppGenerator.CamelCase(pluralized)}.length }</span>
                        ) 
                      }
                    </Link>
                  </li>
                `
              );
            }).join('')}
            {
              isLoggedIn ? (
                <li>
                  <a onClick={ logout }>Logout ( { user.username } )</a>
                </li>
              ) : (
                <li>
                  <a onClick={()=> attemptLogin({ username: 'Moe', password: 'moe', id: 1 })}>Login</a>
                </li>
              )
            }
          </ul>
          <div className='label label-default'>
              pathname: <em>{ location.pathname }</em>
          </div>
          </div>
        );
      };
      const Nav = connect(null, (dispatch)=> {
        return {
          attemptLogin: (credentials)=> {
            return dispatch(attemptLogin(credentials));
          },
          logout: ()=> {
            dispatch(setUser({}));
          }
        };
      })(_Nav);
    `;
  }
  static reducers(models){
    return `{
      user: (state={}, action)=> {
        switch(action.type){
          case 'SET_USER': {
            console.log(action);
            state = action.data;
          }
        }
        return state;
      },
      ${ models.map( model => {
        return `
          ${AppGenerator.CamelCase(pluralize(model.name))}: (state = [], action)=> {
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
<${script} src='https://cdnjs.cloudflare.com/ajax/libs/axios/0.17.0/axios.js'></${script}>
<link href='https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css' rel='stylesheet' />
`;

  }
  static generate(str){
    const script = 'script';
    const app = JSON.parse(decodeURIComponent(str));
    app.api = app.api || 'http://localhost:3003';
    const { name, models } = app;
    const iframe = $('#appFrame');
    const html = `
<html> 
  <head>
    ${AppGenerator.scripts()}
    <meta name="viewport" content="width=device-width, initial-scale=1">
  </head>
  <body>
    <div id='root'></div>
  </body>
  <${script} type='text/babel'>
    const { Link, HashRouter, Route, Switch } = ReactRouterDOM;
    const { Component } = React;
    const Router = HashRouter;
    const { Provider, connect } = ReactRedux;


    ${AppGenerator.Comment( 'SET UP STORE' )}

    const { createStore, combineReducers, applyMiddleware } = Redux;
    const { createLogger } = reduxLogger;

    const store = createStore(combineReducers(
      ${ AppGenerator.reducers(models) }
    ), applyMiddleware(createLogger({})), applyMiddleware(ReduxThunk.default));

    const attemptLogin = (credentials)=> {
      return (dispatch)=> {
        /* uncomment to use api
        axios.post('${app.api}/api/tokens', credentials)
          .then( result => result.data.token)
          .then( token => axios.get('http://localhost:3003/api/me', { headers: { auth: token}}))
          .then( result => dispatch(setUser(result.data)));
        */
        return dispatch(setUser(credentials));
      }
    };

    const setUser = (credentials)=> {
      return {
          type: 'SET_USER',
          data: credentials
      };
    };

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
    iframe.attr("src", `data:text/html;charset=utf-8,${html}`);
    window._html = html;
      $('pre code').each(function(i, block) {
    hljs.highlightBlock(block);
  });
    //hljs.highlightBlock($('#codePreview')[0]);
  }
}
