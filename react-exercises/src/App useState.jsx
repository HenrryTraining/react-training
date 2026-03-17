import { useState } from "react"

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <h2>{count}</h2>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <button onClick={() => setCount(count - 1)}>Decrement</button>
    </div>
  )
}

function ShowHide() {
  const [visible, setVisible] = useState(true);

  return (
    <div>
      {visible && <p>Ahora me vez</p>} 
      <button onClick={() => setVisible(!visible)}>
        {visible?"Ocultar texto":"Mostrar Texto"}
      </button>

    </div>
  )
}

export default function App() {
  return (
    <>
      <div>
        <Counter />
      </div>
      <div>
        <ShowHide />
      </div>
    </>
  )
}
