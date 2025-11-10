import React, { useState } from "react";

function TodoList() {
  const [task, setTask] = useState("");
  const [list, setList] = useState([]);

  const addTask = () => {
    if (task.trim() === "") return;
    setList([...list, task]);
    setTask("");
  };

  const removeTask = (index) => {
    setList(list.filter((_, i) => i !== index));
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>To-Do List</h2>
      <input
        value={task}
        onChange={(e) => setTask(e.target.value)}
        placeholder="Enter task"
      />
      <button onClick={addTask}>Add</button>

      <ul>
        {list.map((item, index) => (
          <li key={index}>
            {item} <button onClick={() => removeTask(index)}>❌</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TodoList;
