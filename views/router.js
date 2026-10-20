import express from "express";
import booksController from "../controllers/booksController.js";

const Router = express.Router();

Router.route("/books")
  .get(booksController.getAllBooks)
  .post(booksController.createBook);

Router.route("/books/:id") // <-- this defines an endpoint with a "placeholder" for the id
.get(booksController.getBookById)
.put(booksController.updateBookById)
.delete(booksController.deleteBookById);

export default Router;