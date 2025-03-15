import React, { useEffect, useRef, useState } from 'react';

const CreateTodo = ({ addTodo }) => {
  const [text, setText] = useState('');
  const inputRef = useRef();

  useEffect(() => {
    inputRef.current.focus();
  }, [inputRef]);

  const clearInputHandler = () => {
    setText('');
    inputRef.current.focus();
  };

  return (
    <div>
      <input
        ref={inputRef}
        type='text'
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button
        onClick={() => {
          addTodo(text);
          clearInputHandler();
        }}
      >
        Add
      </button>
    </div>
  );
};

export default CreateTodo;
