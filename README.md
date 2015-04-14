# Light.js

Light.js is a minimalistic javascript framework for building RESTFull web applications.

##Documentation

Light.js contains the necessary functionality to work with a DOM tree.

  * $.gId     - search by id
  * $.gClass  - search by ClassName
  * $.gTag    - search by Tag Name
  * $.gQ      - search by QuerySeletor
  * $.gQA     - search by QuerySelectorAll

Light.js has a routing.
Example routing configuration shown below.

*  $.router
*     .when('#todo', {
*     controller:'TodoCtrl',
*     action: '$index'
*  })
*     .when('#todo/:id', {
*     controller:'TodoCtrl',
*     action: 'todoItem'
*  })
*     .when('#test', {
*     controller:'TestCtrl'
*  })
*     .otherwise({
*     redirectTo:'#todo'
*  })
*  .run();

In framework integrated publicher/observer design pattern.
Syntax for make object as pubisher need to call function

  * $.publisher(objectPublisher)

Framework contains functions for build easy RESTFull applications

  * $.http.get     - to create GET request 
  * $.http.post    - to create GET request 
  * $.http.delete  - to create GET request 
