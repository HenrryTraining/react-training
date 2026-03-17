// Ejercicio 1
function UserCard({name, email}){
  return (
    <div>
      <h3>{name}</h3>
      <p>{email}</p>
    </div>
  )
}

function ProductCard({name, price}) {
  return(
    <div>
      <h3>{name}</h3>
      <p>{price}</p>
    </div>
  )
}


// Ejercicio 2 Listas con Map
function UserList()
{
  const users = [
    {id: 1, name: 'Ana'},
    {id: 2, name: 'Luis'},
    {id: 3, name: 'Maria'},
  ]
  return(
    <div>
      {users.map( user=>(
        <p key={user.id}>{user.name}</p>
      ))}
    </div>
  )
}

function ProductList()
{
  const products = [ "Mouse", "Keyboard", "Monitor"]
  return (
    <div>
      {
        products.map(
          product=>(
            <p key={product}>{product}</p>
          )
        )
      }
    </div>
  ) 
}

export default function App() {
  return(
    <>
      <div>
        <ProductCard name="Laptop" price={1200} />
      </div>      
       <div>
        <UserCard name="Henrry" email="henrry@email.com" />
      </div> 
      <div>
        <h1>Usuarios</h1>
        <UserList/>
      </div>
      <div>
        <h1>Products</h1>
        <ProductList/>
      </div>
    </>
  )
}
