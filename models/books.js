import joi from "joi";

const booksSchema = joi.object({
  id: joi.string().required(),
  title: joi.string().required(),
  author: joi.string().required(),
  genre: joi.string().required(),
  status: joi.string().required(),
  rating: joi.string().required()
});

export default booksSchema;