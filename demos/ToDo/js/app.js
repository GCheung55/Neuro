var loader = require('./link/Web/link')
loader.alias('company', './company/Company')
loader.alias('neuro', './neuro')
loader.alias('todo', './ToDo')
loader.base('./');
loader.load('todo/main')

