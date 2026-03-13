function UserCard({ user }) {

  return (
    <div style={{
      border: "1px solid #ddd",
      padding: "15px",
      borderRadius: "8px",
      background: "white",
      marginBottom: "10px",
      width: "300px"
    }}>
      <h3>{user.name}</h3>
      <p>{user.email}</p>
      <p>{user.company.name}</p>
    </div>
  )

}

export default UserCard