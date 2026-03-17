
// Crear Tareas

import { useState } from "react"

function ToDo() {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState("");

  const [editingIndex, setEditingIndex] = useState(null);
  const [editText, setEditText] = useState("")

  // Agregar tarea
  const addTask = () => {
    if (input === "") return

    const newTasks = [...tasks, input]
    setTasks(newTasks)
    setInput("")
  }

  // Eliminar tarea
  const deleteTask = (taskToDelete) => {
    const newTasks = tasks.filter(t => t !== taskToDelete)
    setTasks(newTasks)
  }

  // Edicion
  const editTask = (index) => {
    setEditingIndex(index)
    setEditText(tasks[index])
  }

  // Guardar edicion
  const saveEdit =() => {
    const newTasks = tasks.map((task,index)=>
      index === editingIndex ? editText: task
    );
    
    setTasks(newTasks);
    setEditingIndex(null);
    setEditText("");

  }

  return (
    <>
      <div style={{ marginBottom: "10px" }}>
        <input
          placeholder="Escribe una tarea"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </div>

      <button onClick={addTask}>Agregar</button>

      <ul style={{ listStyle: "none", padding: 0 }}>
        {tasks.map((task, index) => (
          <li
            key={index}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto",
              gap: "10px",
              marginBottom: "8px",
              padding: "8px",
              borderBottom: "1px solid #ddd"
            }}
          >
            {editingIndex === index ? (
              <>
                <input value={editText} onChange={(e) => setEditText(e.target.value)}/>
                <button onClick={saveEdit}>Guardar</button>
              </>
            ):
            <>
              <span>{task}</span>
              <div>
              <button onClick={() => editTask(index)}>
                Editar
              </button>
              <button onClick={() => deleteTask(task)}>
                Eliminar
              </button>
              </div>
              </>

          }
          </li>
        ))}
      </ul>

    </>
  )
}

export default function App() {
  return (
    <>
      <div>
        <ToDo />
      </div>
    </>
  )
}
