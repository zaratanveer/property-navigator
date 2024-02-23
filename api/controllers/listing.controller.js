// Import necessary modules and models
import Listing from "../models/listing.model.js";
import User from "../models/user.model.js";
import { errorHandler } from "../utils/error.js";

// Controller to create a new listing
export const createListing = async (req, res, next) => {
  try {
    const listing = await Listing.create(req.body);
    return res.status(201).json(listing);
  } catch (error) {
    next(error);
  }
};

// Controller to delete an existing listing
export const deleteListing = async (req, res, next) => {
  const listing = await Listing.findById(req.params.id);

  if (!listing) {
    return next(errorHandler(404, "Listing not found"));
  }

  try {
    await Listing.findByIdAndDelete(req.params.id);
    res.status(200).json("Listing has been deleted");
  } catch (error) {
    next(error);
  }
};

// Controller to update an existing listing
export const updateListing = async (req, res, next) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) {
    return next(errorHandler(404, "Listing not found!"));
  }
  try {
    const updatedListing = await Listing.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.status(200).json(updatedListing);
  } catch (error) {
    next(error);
  }
};

// Controller to get details of a specific listing
export const getListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return next(errorHandler(404, "Listing not found!"));
    }
    res.status(200).json(listing);
  } catch (error) {
    next(error);
  }
};

// Controller to search for listings
export const getListings = async (req, res, next) => {
  try {
    // Extract query parameters
    // Define default values if parameters are not provided
    const limit = parseInt(req.query.limit) || 9;
    const startIndex = parseInt(req.query.startIndex) || 0;
    let furnished = req.query.furnished;

    // Handle undefined or 'false' values for furnished parameter
    if (furnished === undefined || furnished === "false") {
      furnished = { $in: [false, true] };
    }

    // Similar handling for parking and type parameters
    let parking = req.query.parking;

    if (parking === undefined || parking === "false") {
      parking = { $in: [false, true] };
    }

    let type = req.query.type;

    if (type === undefined || type === "all") {
      type = { $in: ["sale", "rent"] };
    }

    // Handle search term, sorting, and ordering
    const searchTerm = req.query.searchTerm || "";
    const sort = req.query.sort || "createdAt";
    const order = req.query.order || "desc";

    // Perform the search query
    const listings = await Listing.find({
      name: { $regex: searchTerm, $options: "i" },
      furnished,
      parking,
      type,
    })
      .sort({ [sort]: order })
      .limit(limit)
      .skip(startIndex);

    return res.status(200).json(listings);
  } catch (error) {
    next(error);
  }
};

// Controller to add a property to user's favorites
export const addFavouriteProperty = async (req, res, next) => {
  try {
    const { userId, propertyId } = req.body;

    // Update user's favorites array
    const user = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { favourites: propertyId } }, // Use $addToSet to avoid duplicates
      { new: true }
    );
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// Controller to remove a property from user's favorites
export const removeFavouriteProperty = async (req, res, next) => {
  try {
    const { userId, propertyId } = req.body;

    // Update user's favorites array
    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { favourites: propertyId } },
      { new: true }
    );

    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// Controller to get favorite properties for a user
export const getFavourite = async (req, res, next) => {
  const userId = req.params.id;

  try {
    // Find the user by ID and populate the 'favorites' array with property details
    const user = await User.findById(userId).populate("favourites");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({ success: true, favourites: user.favourites });
  } catch (error) {
    next(error);
  }
};
