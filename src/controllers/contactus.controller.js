import db from "../databases/models/index.js";
const { ContactUs, Op } = db;
import { addContactValidator } from "../validators/contact.validator.js";

/**
 * Save contact us content
 * @param {*} request 
 * @returns 
 */
export const contactUsSaveContent = async (request) => {
  try {
    const { payload, user } = request;

    const insertedData = {
      address: payload.address,
      phoneOne: payload.phoneOne,
      phoneTwo: payload.phoneTwo,
      email: payload.email,
      website: payload.website,
    };

    const [err, validatedData] = await addContactValidator(insertedData);
    if (err) {
      return err;
    }
    const result = await ContactUs.create(validatedData);
    return {
      status: 200,
      data: payload,
      message: "Content saved successfully",
      error: {},
    };
  } catch (e) {
    return {
      status: 500,
      data: [],
      error: { message: "Something went wrong !", reason: e.message },
    };
  }
};
/**
 * List all contact us records
 * @param {*} request
 * @returns
 */
export const listAllContactUs = async (request) => {
  try {
    const result = await ContactUs.findAll();
    return {
      status: 200,
      data: result,
      message: "Records fetched successfully",
      error: {},
    };
  } catch (e) {
    return {
      status: 500,
      data: [],
      error: { message: "Something went wrong !", reason: e.message },
    };
  }
};
