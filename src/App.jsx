import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [users, setUsers] = useState(() => {
    return JSON.parse(localStorage.getItem("users")) || [];
  });

  const [books, setBooks] = useState(() => {
    return JSON.parse(localStorage.getItem("books")) || [];
  });

  const [transactions, setTransactions] = useState(() => {
    return JSON.parse(localStorage.getItem("transactions")) || [];
  });

  const [loggedInUser, setLoggedInUser] = useState(() => {
    const user = localStorage.getItem("loggedInUser");
    return user ? JSON.parse(user) : null;
  });

  const [page, setPage] = useState("dashboard");
  const [loginMessage, setLoginMessage] = useState("");

  // Default administrator
  useEffect(() => {
    if (users.length === 0) {
      const admin = {
        id: 1,
        name: "Library Administrator",
        membershipId: "ADMIN001",
        password: "admin123",
        role: "admin",
      };

      setUsers([admin]);
      localStorage.setItem("users", JSON.stringify([admin]));
    }
  }, []);

  // Save data
  useEffect(() => {
    localStorage.setItem("users", JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem("books", JSON.stringify(books));
  }, [books]);

  useEffect(() => {
    localStorage.setItem("transactions", JSON.stringify(transactions));
  }, [transactions]);

  // LOGIN
  function handleLogin(e) {
    e.preventDefault();

    const id = e.target.membershipId.value;
    const password = e.target.password.value;

    const user = users.find(
      (u) => u.membershipId === id && u.password === password
    );

    if (!user) {
      setLoginMessage("Invalid membership ID or password.");
      return;
    }

    localStorage.setItem("loggedInUser", JSON.stringify(user));
    setLoggedInUser(user);
    setLoginMessage(`Login successful. Welcome ${user.name}!`);
    setPage("dashboard");
  }

  // LOGOUT
  function logout() {
    localStorage.removeItem("loggedInUser");
    setLoggedInUser(null);
    setPage("dashboard");
    setLoginMessage("");
  }

  // ADD BOOK
  function addBook(e) {
    e.preventDefault();

    const form = e.target;
    const title = form.title.value;
    const author = form.author.value;
    const genre = form.genre.value;
    const isbn = form.isbn.value;
    const quantity = Number(form.quantity.value);

    if (books.some((book) => book.isbn === isbn)) {
      alert("This ISBN already exists.");
      return;
    }

    const newBook = {
      id: Date.now(),
      title,
      author,
      genre,
      isbn,
      quantity,
    };

    setBooks((currentBooks) => [...currentBooks, newBook]);
    form.reset();
  }

  // UPDATE BOOK
  function updateBook(id) {
    const book = books.find((b) => b.id === id);

    if (!book) return;

    const title = prompt("Book title:", book.title);
    const author = prompt("Author:", book.author);
    const genre = prompt("Genre:", book.genre);
    const isbn = prompt("ISBN:", book.isbn);
    const quantityInput = prompt("Quantity:", book.quantity);

    setBooks((currentBooks) =>
      currentBooks.map((b) =>
        b.id === id
          ? {
              ...b,
              title: title || b.title,
              author: author || b.author,
              genre: genre || b.genre,
              isbn: isbn || b.isbn,
              quantity:
                quantityInput === null || quantityInput === ""
                  ? b.quantity
                  : Number(quantityInput),
            }
          : b
      )
    );
  }

  // DELETE BOOK
  function deleteBook(id) {
    if (!confirm("Delete this book?")) return;

    setBooks((currentBooks) => currentBooks.filter((book) => book.id !== id));
  }

  // RECORD TRANSACTION
  function recordTransaction(e) {
    e.preventDefault();

    const form = e.target;
    const bookId = Number(form.transactionBook.value);
    const quantity = Number(form.transactionQuantity.value);
    const type = form.transactionType.value;

    const book = books.find((b) => b.id === bookId);

    if (!book) return;

    if (type === "borrow" && quantity > book.quantity) {
      alert("Not enough books available.");
      return;
    }

    setBooks((currentBooks) =>
      currentBooks.map((b) =>
        b.id === bookId
          ? {
              ...b,
              quantity:
                type === "borrow"
                  ? b.quantity - quantity
                  : b.quantity + quantity,
            }
          : b
      )
    );

    const newTransaction = {
      book: book.title,
      type: type === "add" ? "Stock Added" : "Book Borrowed",
      quantity,
      date: new Date().toLocaleString(),
    };

    setTransactions((currentTransactions) => [
      ...currentTransactions,
      newTransaction,
    ]);

    form.reset();
  }

  // ADD USER
  function addUser(e) {
    e.preventDefault();

    if (!loggedInUser || loggedInUser.role !== "admin") {
      alert("Only administrators can manage users.");
      return;
    }

    const form = e.target;
    const name = form.userName.value;
    const membershipId = form.userId.value;
    const password = form.userPassword.value;
    const role = form.userRole.value;

    if (users.some((user) => user.membershipId === membershipId)) {
      alert("Membership ID already exists.");
      return;
    }

    const newUser = {
      id: Date.now(),
      name,
      membershipId,
      password,
      role,
    };

    setUsers((currentUsers) => [...currentUsers, newUser]);
    form.reset();
  }

  // DELETE USER
  function deleteUser(id) {
    if (!loggedInUser) return;

    if (id === loggedInUser.id) {
      alert("You cannot delete your own account.");
      return;
    }

    if (!confirm("Delete this user?")) return;

    setUsers((currentUsers) =>
      currentUsers.filter((user) => user.id !== id)
    );
  }

  // DASHBOARD
  function Dashboard() {
    const totalCopies = books.reduce(
      (sum, book) => sum + Number(book.quantity),
      0
    );

    const lowStock = books.filter((book) => book.quantity < 2).length;

    return (
      <>
        <div className="section-card">
          <h2>Library Dashboard</h2>
          <p>Welcome to the Kulture Library Management System.</p>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card">
            📚
            <h3>Books</h3>
            <p>{books.length}</p>
            <button onClick={() => setPage("books")}>Manage Books</button>
          </div>

          <div className="dashboard-card">
            📦
            <h3>Copies</h3>
            <p>{totalCopies}</p>
          </div>

          <div className="dashboard-card">
            ⚠️
            <h3>Low Stock</h3>
            <p>{lowStock}</p>
          </div>

          <div className="dashboard-card">
            🔄
            <h3>Transactions</h3>
            <p>{transactions.length}</p>
          </div>
        </div>

        <div className="section-card">
          <h2>Book Availability</h2>
          <BookTable />
        </div>
      </>
    );
  }

  // BOOK TABLE
  function BookTable() {
    if (books.length === 0) {
      return <p>No books available.</p>;
    }

    return (
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Author</th>
            <th>Genre</th>
            <th>ISBN</th>
            <th>Quantity</th>
          </tr>
        </thead>

        <tbody>
          {books.map((book) => (
            <tr
              key={book.id}
              className={book.quantity < 2 ? "low-stock" : ""}
            >
              <td>{book.title}</td>
              <td>{book.author}</td>
              <td>{book.genre}</td>
              <td>{book.isbn}</td>
              <td>{book.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  // BOOK MANAGEMENT
  function BookPage() {
    return (
      <>
        <div className="section-card">
          <h2>📚 Book Management</h2>

          <form id="bookForm" onSubmit={addBook}>
            <input name="title" placeholder="Book title" required />
            <input name="author" placeholder="Author" required />
            <input name="genre" placeholder="Genre" required />
            <input name="isbn" placeholder="ISBN" required />
            <input
              name="quantity"
              type="number"
              min="0"
              placeholder="Quantity"
              required
            />

            <button type="submit">Add Book</button>
          </form>
        </div>

        <div className="section-card">
          <h2>Existing Books</h2>

          {books.length === 0 ? (
            <p>No books have been added.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Quantity</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {books.map((book) => (
                  <tr key={book.id}>
                    <td>{book.title}</td>
                    <td>{book.author}</td>
                    <td>{book.quantity}</td>
                    <td>
                      <button onClick={() => updateBook(book.id)}>
                        Update
                      </button>

                      <button onClick={() => deleteBook(book.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </>
    );
  }

  // TRANSACTIONS
  function TransactionPage() {
    return (
      <>
        <div className="section-card">
          <h2>🔄 Transactions</h2>

          <form id="transactionForm" onSubmit={recordTransaction}>
            <select name="transactionBook" required>
              {books.length === 0 ? (
                <option value="">No books available</option>
              ) : (
                books.map((book) => (
                  <option key={book.id} value={book.id}>
                    {book.title}
                  </option>
                ))
              )}
            </select>

            <select name="transactionType">
              <option value="add">Add Stock</option>
              <option value="borrow">Borrow Book</option>
            </select>

            <input
              name="transactionQuantity"
              type="number"
              min="1"
              placeholder="Quantity"
              required
            />

            <button type="submit" disabled={books.length === 0}>
              Record
            </button>
          </form>
        </div>

        <div className="section-card">
          <h2>Transaction History</h2>

          {transactions.length === 0 ? (
            <p>No transactions recorded.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Book</th>
                  <th>Type</th>
                  <th>Quantity</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {transactions.map((transaction, index) => (
                  <tr key={`${transaction.date}-${index}`}>
                    <td>{transaction.book}</td>
                    <td>{transaction.type}</td>
                    <td>{transaction.quantity}</td>
                    <td>{transaction.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </>
    );
  }

  // USER MANAGEMENT
  function UserPage() {
    if (!loggedInUser || loggedInUser.role !== "admin") {
      return (
        <div className="section-card">
          <h2>Access Denied</h2>
          <p>Only administrators can manage users.</p>
        </div>
      );
    }

    return (
      <>
        <div className="section-card">
          <h2>👥 User Management</h2>

          <form id="userForm" onSubmit={addUser}>
            <input name="userName" placeholder="Name" required />
            <input name="userId" placeholder="Membership ID" required />
            <input
              name="userPassword"
              type="password"
              placeholder="Password"
              required
            />

            <select name="userRole">
              <option value="member">Member</option>
              <option value="librarian">Librarian</option>
              <option value="admin">Admin</option>
            </select>

            <button type="submit">Add User</button>
          </form>
        </div>

        <div className="section-card">
          <h2>Registered Users</h2>

          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Membership ID</th>
                <th>Role</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.membershipId}</td>
                  <td>{user.role}</td>
                  <td>
                    <button onClick={() => deleteUser(user.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    );
  }

  // PROFILE
  function Profile() {
    return (
      <div className="section-card">
        <h2>👤 My Profile</h2>

        <p>
          <strong>Name:</strong> {loggedInUser.name}
        </p>

        <p>
          <strong>Membership ID:</strong> {loggedInUser.membershipId}
        </p>

        <p>
          <strong>Role:</strong> {loggedInUser.role}
        </p>
      </div>
    );
  }

  // LOGIN PAGE
  if (!loggedInUser) {
    return (
      <div className="login-page">
        <div className="login-container">
          <div className="library-header">
            <div className="library-icon">📚</div>
            <h1>Kulture Library</h1>
            <p>Library Management System</p>
          </div>

          <div className="login-card">
            <h2>Welcome Back</h2>
            <p className="login-description">
              Sign in to access the library system.
            </p>

            <form id="loginForm" onSubmit={handleLogin}>
              <div className="form-group">
                <label htmlFor="membershipId">Membership ID</label>
                <input
                  name="membershipId"
                  type="text"
                  placeholder="Enter your membership ID"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  required
                />
              </div>

              <div className="login-options">
                <label className="remember-me">
                  <input type="checkbox" name="rememberMe" />
                  <span>Remember me</span>
                </label>

                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    alert("Please contact the library administrator.");
                  }}
                >
                  Forgot Password?
                </a>
              </div>

              <button type="submit" className="login-button">
                Login
              </button>
            </form>

            <p className="login-message">{loginMessage}</p>
          </div>

          <div className="login-footer">
            <p>&copy; 2026 Kulture Library</p>
            <p>All rights reserved.</p>
          </div>
        </div>
      </div>
    );
  }

  // MAIN DASHBOARD
  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>📚 Kulture Library</h1>
          <p>Library Management System</p>
        </div>

        <button onClick={logout}>Logout</button>
      </header>

      <nav className="dashboard-nav">
        <button onClick={() => setPage("dashboard")}>🏠 Dashboard</button>

        <button onClick={() => setPage("books")}>📚 Books</button>

        <button onClick={() => setPage("transactions")}>
          🔄 Transactions
        </button>

        {loggedInUser.role === "admin" && (
          <button onClick={() => setPage("users")}>👥 Users</button>
        )}

        <button onClick={() => setPage("profile")}>👤 Profile</button>
      </nav>

      <main id="content">
        {page === "dashboard" && <Dashboard />}
        {page === "books" && <BookPage />}
        {page === "transactions" && <TransactionPage />}
        {page === "users" && <UserPage />}
        {page === "profile" && <Profile />}
      </main>
    </div>
  );
}

export default App;
