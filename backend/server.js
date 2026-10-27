
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Connect to the MySQL database
const db = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
        rejectUnauthorized: true
    },
    waitForConnections: true,
    connectionLimit: 10
});

// Home route: check if the API is running
app.get("/", (req, res) => {
    res.json({
        message: "UPDATED SERVER 123"
    });
});

// Test the MySQL database connection
app.get("/db-test", async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT DATABASE() AS databaseName"
        );

        res.json({
            message: "MySQL connected successfully!",
            database: rows[0].databaseName
        });
    } catch (error) {
        console.error("Database error:", error.message);

        res.status(500).json({
            error: "Database connection failed. Check your server configuration."
        });
    }
});

// Get all books from MySQL
app.get("/books", async (req, res) => {
    try {
        const [books] = await db.query(
            "SELECT * FROM books ORDER BY id DESC"
        );

        res.json(books);
    } catch (error) {
        console.error("Books error:", error.message);

        res.status(500).json({
            error: "Could not retrieve books."
        });
    }
});

// ADD BOOK
app.post("/books", async (req, res) => {
    try {
        const { title, author, genre, isbn, quantity } = req.body;

        if (
            typeof title !== "string" || !title.trim() ||
            typeof author !== "string" || !author.trim() ||
            typeof genre !== "string" || !genre.trim() ||
            typeof isbn !== "string" || !isbn.trim() ||
            quantity === undefined ||
            quantity === null ||
            quantity === "" ||
            !Number.isInteger(Number(quantity)) ||
            Number(quantity) < 0
        ) {
            return res.status(400).json({
                message: "Please provide valid book details."
            });
        }

        const [result] = await db.query(
            `INSERT INTO books (title, author, genre, isbn, quantity)
             VALUES (?, ?, ?, ?, ?)`,
            [
                title.trim(),
                author.trim(),
                genre.trim(),
                isbn.trim(),
                Number(quantity)
            ]
        );

        res.status(201).json({
            message: "Book added successfully.",
            id: result.insertId
        });
    } catch (error) {
        console.error("Add book error:", error.message);

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                message: "This ISBN already exists."
            });
        }

        res.status(500).json({
            message: "Could not add the book."
        });
    }
});

// UPDATE BOOK
app.put("/books/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { title, author, genre, isbn, quantity } = req.body;

        if (!Number.isInteger(id) || id < 1) {
            return res.status(400).json({
                message: "Invalid book ID."
            });
        }

        if (
            typeof title !== "string" || !title.trim() ||
            typeof author !== "string" || !author.trim() ||
            typeof genre !== "string" || !genre.trim() ||
            typeof isbn !== "string" || !isbn.trim() ||
            quantity === undefined ||
            quantity === null ||
            quantity === "" ||
            !Number.isInteger(Number(quantity)) ||
            Number(quantity) < 0
        ) {
            return res.status(400).json({
                message: "Please provide valid book details."
            });
        }

        const [result] = await db.query(
            `UPDATE books
             SET title = ?, author = ?, genre = ?, isbn = ?, quantity = ?
             WHERE id = ?`,
            [
                title.trim(),
                author.trim(),
                genre.trim(),
                isbn.trim(),
                Number(quantity),
                id
            ]
        );

        if (result.affectedRows === 0) {
            const [existing] = await db.query(
                "SELECT id FROM books WHERE id = ?",
                [id]
            );

            if (existing.length === 0) {
                return res.status(404).json({
                    message: "Book not found."
                });
            }
        }

        res.json({
            message: "Book updated successfully."
        });
    } catch (error) {
        console.error("Update book error:", error.message);

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                message: "This ISBN already exists."
            });
        }

        res.status(500).json({
            message: "Could not update the book."
        });
    }
});

// DELETE BOOK
app.delete("/books/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id < 1) {
            return res.status(400).json({
                message: "Invalid book ID."
            });
        }

        const [result] = await db.query(
            "DELETE FROM books WHERE id = ?",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Book not found."
            });
        }

        res.json({
            message: "Book deleted successfully."
        });
    } catch (error) {
        console.error("Delete book error:", error.message);

        res.status(500).json({
            message: "Could not delete the book."
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

