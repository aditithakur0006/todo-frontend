import { useEffect, useState } from "react";
import Header from "./components/Header";
import TodoItems from "./components/TodoItems";
import CreateTodo from "./components/CreateTodo";

// const SERVER_URL = "http://localhost:3001";
const SERVER_URL = process.env.BACKEND_SERVER || "http://3.20.219.85:3001" ;

const App = () => {
  const [todoItems, setTodoItems] = useState([]);

  // Fetch all todos
  useEffect(() => {
    fetch(`${SERVER_URL}/todos`)
      .then((res) => res.json())
      .then(setTodoItems);
  }, []);

  // Add a new todo
  const addTodoHandler = (todo) => {
    const todoItem = { description: todo };

    fetch(`${SERVER_URL}/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(todoItem),
    })
      .then((res) => res.json())
      .then((newTodo) => {
        setTodoItems([...todoItems, newTodo]);
      });
  };

  // Delete a todo
  const deleteTodoHandler = (id) => {
    fetch(`${SERVER_URL}/delete/${id}`, { method: "DELETE" })
      .then(() => {
        setTodoItems(todoItems.filter((item) => item.id !== id));
      });
  };

  // Update a todo
  const updateTodoHandler = (id, newDescription) => {
    fetch(`${SERVER_URL}/update/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description: newDescription }),
    })
      .then((res) => res.json())
      .then((updatedTodo) => {
        setTodoItems(
          todoItems.map((item) =>
            item.id === id ? { ...item, description: updatedTodo.description } : item
          )
        );
      });
  };

  return (
    <div className="App">
      <Header />
      <CreateTodo addTodo={addTodoHandler} />
      <TodoItems
        todoItems={todoItems}
        onDelete={deleteTodoHandler}
        onUpdate={updateTodoHandler}
      />
    </div>
  );
};

export default App;
