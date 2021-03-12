const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const userExists = users.find(user => user.username === username);
  if (!userExists) {
    return response.status(404).json({
      error: "Not Found"
    })
  }
  request.username = username;
  return next();
}

app.post('/users', (request, response) => {
  const { username, name } = request.body;

  const userExists = users.find(user => user.username === username);
  if (userExists) {
    return response.status(400).json({
      error: "Username already in use."
    })
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }
  users.push(user);
  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const targetIndex = users.findIndex(user => user.username === username);
  return response.status(200).json(users[targetIndex].todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request;

  const targetIndex = users.findIndex(user => user.username === username)

  const { title, deadline } = request.body;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  users[targetIndex].todos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const { id } = request.params;

  const { title, deadline } = request.body;

  const userIndex = users.findIndex(user => user.username === username);

  const todoIndex = users[userIndex].todos.findIndex(todo => todo.id == id);

  if (todoIndex === -1) {
    return response.status(404).json({
      error: "Not found"
    });
  };

  users[userIndex].todos[todoIndex] = {
    ...users[userIndex].todos[todoIndex],
    deadline,
    title,
  }

  return response.status(201).json(users[userIndex].todos[todoIndex]);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const { id } = request.params;

  const userIndex = users.findIndex(user => user.username === username);
  const todoIndex = users[userIndex].todos.findIndex(todo => todo.id == id);

  if (todoIndex === -1) {
    console.log("here")
    return response.status(404).json({
      error: "Not found"
    });
  };

  users[userIndex].todos[todoIndex] = {
    ...users[userIndex].todos[todoIndex],
    done: true
  }
  return response.status(201).json(users[userIndex].todos[todoIndex]);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const { id } = request.params;

  const userIndex = users.findIndex(user => user.username === username);
  const todoIndex = users[userIndex].todos.findIndex(todo => todo.id == id);

  if (todoIndex === -1) {
    return response.status(404).json({
      error: "Not found"
    });
  };

  users[userIndex].todos.splice(todoIndex, 1);

  return response.status(204).send([]);
});

module.exports = app;