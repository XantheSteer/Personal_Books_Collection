import database from "../services/database.js";
import {
  ScanCommand,
  PutCommand,
  GetCommand,
  UpdateCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";
import bookSchema from "../models/books.js";

async function getAllBooks(req, res, next) {
  try {
    const params = {
      TableName: "Books",
    };
    const command = new ScanCommand(params);
    const result = await database.send(command);
    res.status(200).json(result.Items);
  } catch (err) {
    next(err);
  }
}
  
async function createBook(req, res, next) {
  try {
    const uuid = uuidv4();
    req.body.id = uuid;
    const { error, value } = bookSchema.validate(req.body);

    if (error) {
      res.status(400).json({ error: error.details[0].message });
      return;
    }

    const { id, title, author, genre, status, rating } = value;

    const params = {
      TableName: "Books",
      Item: {
        id,
        title,
        author,
        genre,
        status,
        rating,
      },
    };

    const command = new PutCommand(params);

    await database.send(command);

    res
      .status(201)
      .json({ message: "Successfully created book", data: params.Item });
  } catch (error) {
    next(error);
  }
}
async function getBookById(req, res, next) {
  const bookId = req.params.id;
  try {
    const params = {
      TableName: "Books",
      Key: { id: bookId },
    };
    const command = new GetCommand(params);
    const result = await database.send(command);
    if (!result.Item) {
      return res.status(404).json({ message: "No book found" });
    }
    res.status(200).json(result.Item);
  } catch (err) {
    next(err);
  }
}
  
async function updateBookById(req, res, next) {
  try {
    const bookId = req.params.id;
    req.body.id = bookId;
    const { error, value } = bookSchema.validate(req.body);

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { title, author, genre, status, rating} = value;

    // Get the book from DynamoDB
    const getParams = {
      TableName: "Books",
      Key: { id: bookId },
    };

    const getCommand = new GetCommand(getParams);

    const result = await database.send(getCommand);

    const book = result.Item;

    if (!book) {
      return res.status(404).json({ message: "No bookfound" });
    }

    // Update the book in DynamoDB
    const updateParams = {
      TableName: "Books",
      Key: { id: bookId },
      UpdateExpression:
        "set #title = title, #author = author, #genre = genre, #status = status, #rating = rating",
      ExpressionAttributeNames: {
        "#title": "title",
        "#author": "author",
        "#genre": "genre",
        "#status": "status",
        "#rating": "rating",
      },
      ExpressionAttributeValues: {
        "#title": title,
        "#author": author,
        "#genre": genre,
        "#status": status,
        "#rating": rating,
      },
      ReturnValues: "ALL_NEW",
    };
    const updateCommand = new UpdateCommand(updateParams);
    const updatedBook = await database.send(updateCommand);

    res.status(200).json(updatedBook.Attributes);
  } catch (err) {
    next(err);
  }
}
  
  async function deleteBookById(req, res, next) {
    const bookId = req.params.id;
    try {
      const params = {
        TableName: "Books",
        Key: { id: bookId },
      };
      const command = new DeleteCommand(params);
      await database.send(command);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  }
  
  export default {
    getAllBooks,
    createBook,
    getBookById,
    updateBookById,
    deleteBookById,
  };
