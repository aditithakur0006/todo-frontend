import { useState } from "react";

const TodoItems = ({ todoItems, onDelete, onUpdate }) => {
  const [editId, setEditId] = useState(null);
  const [newText, setNewText] = useState("");

  return (
    <ul>
      {todoItems.map((todo) => (
        <li key={todo.id}>
          {editId === todo.id ? (
            <>
              <input
                type="text"
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
              />
              <button
                onClick={() => {
                  onUpdate(todo.id, newText);
                  setEditId(null);
                }}
              >
                Save
              </button>
            </>
          ) : (
            <>
              {todo.description}
              <button onClick={() => onDelete(todo.id)}>Delete</button>
              <button
                onClick={() => {
                  setEditId(todo.id);
                  setNewText(todo.description);
                }}
              >
                Edit
              </button>
            </>
          )}
        </li>
      ))}
    </ul>
  );
};

export default TodoItems;
