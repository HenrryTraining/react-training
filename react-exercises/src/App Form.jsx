import { useState } from "react"

function FormName() {
  const [name, setName] = useState("");
  const handleSubmit = (e)=>{
    e.preventDefault()
    console.log(name)
  }
  return (
    <form onSubmit={handleSubmit}>
      <input placeholder="Name"
        onChange={(e)=>setName(e.target.value)}
       />
       <button>Submmit</button>
    </form>
  )
}

function FormUserEmail() {
  const [user, setUser] = useState("");
  const [email, setEmail] = useState("");
  const handleSubmit = (e)=>{
    e.preventDefault()

    const userEmail = {
      user: user,
      email: email
    }
    console.log(userEmail)
  }
  return (
    <form onSubmit={handleSubmit}>
      <input placeholder="User"
        value={user}
        onChange={(e)=>setUser(e.target.value)}
       />
      <input placeholder="Email"
        value={email}
        onChange={(e)=>setEmail(e.target.value)}
       />
       
       <button>Submmit</button>
    </form>
  )
}

export default function App() {
  return (
    <>
      <div>
        <FormName/>
      </div>
       <div>
        <FormUserEmail/>
      </div>
   </>
  )
}
