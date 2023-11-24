import mongoose, { Date, Schema } from "mongoose";
import bcrypt from "bcrypt";




// Define the user interface
export interface IUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  // Avoid storing passwords in plain text
  // Use a secure hashing mechanism like bcrypt
  password: string;
  phone?: string; // Optional phone number
  publicId: string;
  otp: number;
  otpExpires: Date;
  address?: string; // Optional address
  gender?: string; // Optional gender
   location?: { // Nested object for location
    lng: number; // Latitude
    lat: number; // Longitude
  };
  verified: boolean;
  role: string;
  coverImage?: string; // Optional cover image
  wallet?: Schema.Types.ObjectId; // Reference to wallet document
  profile?: Schema.Types.ObjectId; // Reference to profile document
  nextOfKin?: Schema.Types.ObjectId; // Reference to next-of-kin document
  transactions?: Schema.Types.ObjectId; // Reference to transactions document
  comparePassword(candidatePassword: string): Promise<boolean>; // Method to compare passwords
}

// Define the user schema
const userSchema = new Schema({
 
  firstName: { type: String, required: true }, // Mandatory first name
  lastName: { type: String, required: true }, // Mandatory last name
  publicId: { type: String}, // Unique public ID
  email: {
    type: String,
    required: [true, "Please enter your email address"], // Mandatory email address
    unique: true, // Email address must be unique
  },
  password: {
    type: String,
    required: [true, "Please enter a password"], // Mandatory password
  },
  otp: { type: Number,}, // One-time password (OTP)
  otpExpires: { type: Date,}, // OTP expiry date
  phone: { type: String }, // Optional phone number
  address: { type: String }, // Optional address
  gender: { type: String }, // Optional gender
  location: { // Nested object for location
    lng: { type: Number }, // Latitude
    lat: { type: Number }, // Longitude
  },
  verified: { type: Boolean, default: false }, // Default verification status to false
  role: { type: String }, // Mandatory role
  coverImage: { type: String }, // Optional cover image
  wallet: { type: Schema.Types.ObjectId, ref: "wallets" }, // Reference to wallet document
  profile: { type: Schema.Types.ObjectId, ref: "profile" }, // Reference to profile document
  nextOfKin: { type: Schema.Types.ObjectId, ref: "next-of-kin" }, // Reference to next-of-kin document
  transactions: { type: Schema.Types.ObjectId, ref: "transactions" }, // Reference to transactions document
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  // Check if password is modified
  if (!this.isModified("password",)) {
    // No changes, move on
    next();
    return;
  }

  // Hash the password using bcrypt
  const hash = await bcrypt.hash(this.password, 12);

  // Replace plain text password with hashed password
  this.password = hash;

  // Proceed to save the user
  next();
});

  userSchema.methods.comparePassword = async function (password: string) {
  return await bcrypt.compare(password, this.password)
}

// Create and export the User model
const User = mongoose.model<IUser>("users", userSchema);

export default User;
