# Complete Backend Course with Express.js

## What it is

- Backend crash course with Mongodb, Node.js, Express.js
- API documentation with swagger / OpenAPI
- Data validation with zod
- API testing with Jest

## How to run

```bash
git clone https://github.com/bidursapkota00/MEN-Stack-API-Development.git
cd MEN-Stack-API-Development
npm install
npm run dev
```

## Required environment variables (`.env`)

```bash
NODE_ENV=development
PORT=8080
MONGODB_URI=mongodb+srv://your-mongo-atlas-database-url
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=604800
```

# MERN Stack CRUD Task App - Complete Guide

## Table of Contents

1. [Project Overview](#project-overview)
2. [Project Setup](#project-setup)
3. [Add Database](#add-database)
4. [Create Task Collection Schema](#create-task-collection-schema)
5. [Create Task Controller and Routes](#create-task-controller-and-routes)
6. [Add error handler and 404 handler](#add-error-handler-and-404-handler)
7. [Testing with Jest](#testing-with-jest)
8. [Add Data Validation](#add-data-validation)
9. [Add API Documentation](#add-api-documentation)
10. [Add register and login](#add-register-and-login)
11. [Add Validation for login and registration](#add-validation-for-login-and-registration)
12. [Protect Route](#protect-route)
13. [Add Test for login and register routes](#add-test-for-login-and-register-routes)
14. [Tests for Route protection and Data Validation](#tests-for-route-protection-and-data-validation)
15. [Add User - Task Relationship](#add-user---task-relationship)
16. [Adding Update Task Feature](#adding-update-task-feature)
17. [Adding Delete Task Feature](#adding-delete-task-feature)
18. [Adding Get Task By Id](#adding-get-task-by-id)
19. [Adding Filter and Pagination in get all Tasks](#adding-filter-and-pagination-in-get-all-tasks)

## Project Overview

This guide will walk you through creating a full-stack CRUD (Create, Read, Update, Delete) task management application using the MERN stack:

- **MongoDB**: Database
- **Express.js**: Backend framework
- **React**: Frontend library
- **Node.js**: Runtime environment

## Project Structure

```
task-app/
│  src/
│  ├── controllers/
│  │   └── taskController.ts
│  │   └── authController.ts    # Skip at beginning
│  ├── models/
│  │   └── Task.ts
│  │   └── User.ts    # Skip at beginning
│  ├── routes/
│  │   └── taskRoutes.ts
│  │   └── authRoutes.ts    # Skip at beginning
│  ├── middleware/
│  │   └── auth.ts    # Skip at beginning
│  │   └── validation.ts    # Skip at beginning
│  ├── config/
│  │   └── database.ts
│  ├── utils/    # Skip at beginning
│  │   └── jwt.ts
│  ├── schemas/    # Skip at beginning
│  │   └── taskSchemas.ts
│  │   └── authSchemas.ts
│  ├── tests/    # Skip at beginning
│  │   └── task.test.ts
│  │   └── setup.ts
│  │   └── auth.test.ts
│  └── app.ts
├── .env
├── .gitignore
├── package-lock.json
├── package.json
├── jest.config.js
└── tsconfig.json

```

## Project Setup

### Initialize the Project

```bash
mkdir task-app
cd task-app
```

### Backend Setup

```bash
npm init -y
npm install express mongoose cors dotenv
npm install -D nodemon typescript ts-node @types/node @types/express @types/mongoose @types/cors
npx tsc --init
```

### Update tsconfig.json

```json
{
  "compilerOptions": {
    // ... all the default options
    "target": "ES2020",
    "outDir": "./dist",
    "rootDir": "./src",
    "resolveJsonModule": true
    // ... rest of default options
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "src/tests/**/*"]
}
```

### Update package.json

```json
  "scripts": {
    "dev": "nodemon src/app.ts",
    "build": "tsc",    # Skip at beginning
    "start": "node dist/app.js",    # Skip at beginning
    "test": "jest"    # Skip at beginning
  }
```

## Backend Development

### Server Configuration (`src/app.ts`)

```ts
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server is running. Test on http://localhost:${PORT}/health`);
});

export default app;
```

### Add environment variables (`.env`)

```bash
  NODE_ENV=development
  PORT=8080
```

## Add Database

### Database Configuration (`src/config/database.ts`)

```ts
import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {
  try {
    const mongoURI =
      process.env.MONGODB_URI || "mongodb://localhost:27017/tasks-crud";
    await mongoose.connect(mongoURI);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log("MongoDB disconnected successfully");
  } catch (error) {
    console.error("MongoDB disconnection error:", error);
  }
};
```

### Add environment variables (`.env`)

```bash
  MONGODB_URI=mongodb+srv://username:password@cluster1.dsaf.mongodb.net/task?retryWrites=true&w=majority&
  # For giving custom database name. default is test
  #  mongodb.net/db_name?.....
```

### Update app.ts (`src/app.ts`)

```ts
import { connectDB } from "./config/database";
// ......
// ..... replace app.listen()
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server is running. Test on http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
```

## Create Task Collection Schema

### Task Model (`src/models/Task.ts`)

```ts
import mongoose, { Document, Schema, Types } from "mongoose";

export interface ITask extends Document {
  _id: Types.ObjectId;
  title: string;
  description?: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
  createdBy: mongoose.Types.ObjectId;    # Skip at beginning
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    dueDate: {
      type: Date,
    },
    createdBy: {    # Skip at beginning
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Task = mongoose.model<ITask>("Task", TaskSchema);
```

## Create Task Controller and Routes

### Task Controller (`src/controllers/taskController.ts`)

```ts
import { Request, Response, RequestHandler } from "express";
import { Task } from "../models/Task";

export const getTasks: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      data: { tasks },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching tasks",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const createTask = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const taskData: any = req.body;

    const task = new Task({
      ...taskData,
      // createdBy: (req as any).user._id,
      dueDate: taskData.dueDate ? new Date(taskData.dueDate) : undefined,
    });

    await task.save();

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating task",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
```

### Task Routes (`src/routes/taskRoutes.ts`)

```ts
import { Router } from "express";
import { getTasks, createTask } from "../controllers/taskController";

const router = Router();

router.get("/", getTasks);
router.post("/", createTask);

export default router;
```

### Update app.ts (`src/app.ts`)

```ts
import taskRoutes from "./routes/taskRoutes";
// .....
app.use("/api/tasks", taskRoutes);
```

## Add error handler and 404 handler

### Update app.ts : Error handler and not found handler (`src/app.ts`)

```ts
// Error handling middleware
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).json({
      success: false,
      message: "Something went wrong!",
      error:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Internal server error",
    });
  }
);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});
```

## Testing with Jest

### Jest Configuration

```bash
npm install -D jest @types/jest ts-jest supertest @types/supertest
npm install mongodb-memory-server
npm init jest@latest
```

### Update jest.config.ts

```ts
import type { Config } from "jest";

const config: Config = {
  // ...
  // ...
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: [
    "<rootDir>/src/tests/**/*.test.ts",
    "<rootDir>/src/**/__tests__/**/*.ts",
  ],
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.d.ts",
    "!src/tests/**/*",
    "!src/**/__tests__/**/*",
  ],
  setupFilesAfterEnv: ["<rootDir>/src/tests/setup.ts"],
};
```

### Update package.json

```json
"test": "jest",
```

### Update app.ts

```ts
if (process.env.NODE_ENV !== "test") {
  startServer();
}
```

### Create src/tests/setup.ts

```ts
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});
```

### Tests to create and read tasks

### Create src/tests/tasks.test.ts

```ts
import request from "supertest";
import app from "../app";
import { Task } from "../models/Task";

describe("Tasks API", () => {
  // some setup if necessary
  describe("POST /api/tasks", () => {
    it("should create a new task", async () => {
      const taskData = {
        title: "Test Task",
        description: "Test Description",
        priority: "high",
      };

      const response = await request(app)
        .post("/api/tasks")
        .send(taskData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(taskData.title);
      expect(response.body.data.description).toBe(taskData.description);
      expect(response.body.data.priority).toBe(taskData.priority);
      expect(response.body.data.completed).toBe(false);
    });
  });

  describe("GET /api/tasks", () => {
    beforeEach(async () => {
      await Task.create([
        {
          title: "Task 1",
          completed: false,
          priority: "low",
        },
        {
          title: "Task 2",
          completed: true,
          priority: "high",
        },
        {
          title: "Task 3",
          completed: false,
          priority: "medium",
        },
      ]);
    });

    it("should get all tasks", async () => {
      const response = await request(app).get("/api/tasks").expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.tasks).toHaveLength(3);
    });
  });
});
```

## Run Test

```bash
npm run test
```

## Bonus

### Create .gitignore

```bash
coverage/
.env
```

## Add Data Validation

### Install dependencies

```bash
# Install Zod for validation
npm install zod
```

### Add Schema or data transfer object (dto) defination (`src/schemas/taskSchemas.ts`)

```ts
import { z } from "zod";

export const createTaskSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be less than 100 characters"),
  description: z.string().optional(),
  completed: z.boolean().default(false),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  dueDate: z.iso.datetime().optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
```

### Create validation middleware (`src/middleware/validation.ts`)

```ts
import { Request, Response, NextFunction, RequestHandler } from "express";
import { ZodType, ZodError } from "zod";

export const validateBody = (schema: ZodType): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          message: "Validation error",
          errors: error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          })),
        });
        return;
      }
      next(error);
    }
  };
};
```

### Update Routes (`src/routes/taskRoutes.ts`)

```ts
import { validateBody } from "../middleware/validation";
import { createTaskSchema } from "../schemas/taskSchemas";
// ....
// ....
router.post("/", validateBody(createTaskSchema), createTask);
```

### Update Controller (`src/controllers/taskController.ts`)

```ts
import { CreateTaskInput } from "../schemas/taskSchemas";
// In createTask
const taskData: CreateTaskInput = req.body;
```

## Add API Documentation

### Install dependencies

```bash
# Install swagger dependencies
npm install -D swagger-jsdoc swagger-ui-express @types/swagger-jsdoc @types/swagger-ui-express
```

### Add Swagger configuration (`src/app.ts`)

```ts
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

// ....
const PORT = process.env.PORT || 3000;

// Add this
// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Tasks CRUD API",
      version: "1.0.0",
      description:
        "A simple Tasks CRUD API with Express, TypeScript, and MongoDB",
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: "Development server",
      },
    ],
  },
  apis: ["./src/routes/*.ts"],
};

const swaggerUiOptions = {
  customSiteTitle: "Tasks API Docs",
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
// ....
// ....

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add API Documentation Route
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, swaggerUiOptions)
);
```

### Setup Swagger Schema for Task (`src/routes/taskRoutes.ts`)

```yml
/**
 * @swagger
 * components:
 *   schemas:
 *     Task:
 *       type: object
 *       required:
 *         - title
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the task
 *         title:
 *           type: string
 *           description: The task title
 *         description:
 *           type: string
 *           description: The task description
 *         completed:
 *           type: boolean
 *           description: Task completion status
 *         priority:
 *           type: string
 *           enum: [low, medium, high]
 *           description: Task priority
 *         dueDate:
 *           type: string
 *           format: date-time
 *           description: Task due date
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */
```

### Setup Swagger for Routes (`GET /api/tasks`)

```yml
/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Get all tasks
 *     tags: [Tasks]
 *     responses:
 *       200:
 *         description: List of tasks
 */
```

### Setup Swagger for Routes (`POST /api/tasks`)

```yml
/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               completed:
 *                 type: boolean
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Task created successfully
 */
```

## Add register and login

### Install dependencies

```bash
npm install bcryptjs jsonwebtoken
npm install -D @types/bcryptjs @types/jsonwebtoken
```

### Create utility for generating and verifying access token (`src/utils/jwt.ts`)

```bash
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_EXPIRES_IN = parseInt(process.env.JWT_EXPIRES_IN || "604800"); // 7 days in seconds

export const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, JWT_SECRET);
};
```

### Create User model (`src/models/User.ts`)

```ts
import mongoose, { Document, Schema, Types } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  password: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(password: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Add Document method to compare password
UserSchema.methods.comparePassword = async function (
  password: string
): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

export const User = mongoose.model<IUser>("User", UserSchema);
```

### Add controllers to login and register (`src/controllers/authController.ts`)

```ts
import { Request, Response } from "express";
import { User } from "../models/User";
import { generateToken } from "../utils/jwt";

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password }: any = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
      return;
    }

    const user = new User({ name, email, password });
    await user.save();

    const token = generateToken(user._id.toString());

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error registering user",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password }: any = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
      return;
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
      return;
    }

    const token = generateToken(user._id.toString());

    res.json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error logging in",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
```

### Add routes for login and register

### In (`src/routes/authRoutes.ts`)

```ts
import { Router } from "express";
import { register, login } from "../controllers/authController";

const router = Router();

router.post("/register", register);
router.post("/login", login);

export default router;
```

### In (`src/app.ts`)

```ts
import authRoutes from "./routes/authRoutes";
// ....
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
// ....
```

### Add docs for login and register

### Common setup for user schema and auth response

```ts
const router = Router();
// ...

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         email:
 *           type: string
 *     AuthResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             token:
 *               type: string
 *             user:
 *               $ref: '#/components/schemas/User'
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */
```

### For Register

```ts
/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 */

router.post("/register", validateBody(registerSchema), register);
// ....
```

### For Login

```ts
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 */
```

## Add Validation for login and registration

### Create (`src/schemas/authSchemas.ts`)

```ts
import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const loginSchema = z.object({
  email: z.email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
```

### Update (`src/routes/authRoutes.ts`)

```ts
// ...
import { validateBody } from "../middleware/validation";
import { registerSchema, loginSchema } from "../schemas/authSchemas";
// ....
// ....
// add validateBody
router.post("/register", validateBody(registerSchema), register);
router.post("/login", validateBody(loginSchema), login);
```

### Update (`src/routes/authController.ts`)

```ts
// ...
import { RegisterInput, LoginInput } from "../schemas/authSchemas";
// ....
// ....
// In register
const { name, email, password }: RegisterInput = req.body;
// In login
const { email, password }: LoginInput = req.body;
```

## Protect Route

### Create authentication middleware (`src/middleware/auth.ts`)

```ts
import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { User } from "../models/User";

interface AuthenticatedRequest extends Request {
  user?: any;
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
      return;
    }

    const decoded = verifyToken(token) as { userId: string };
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      res.status(401).json({
        success: false,
        message: "Invalid token. User not found.",
      });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid token.",
    });
  }
};
```

### Add auth middleware to Routes (`src/routes/taskRoutes.ts`)

```ts
import { authenticate } from "../middleware/auth";
// ....
// ....
// Add security in swagger
/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 */
router.post("/", authenticate, validateBody(createTaskSchema), createTask);
// Add authenticate in route handler
```

## Add Test for login and register routes

### Create (`src/tests/auth.test.ts`)

```ts
import request from "supertest";
import app from "../app";
import { User } from "../models/User";

describe("Auth API", () => {
  describe("POST /api/auth/register", () => {
    it("should register a new user", async () => {
      const userData = {
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
      };

      const response = await request(app)
        .post("/api/auth/register")
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.email).toBe(userData.email);
    });

    it("should not register user with duplicate email", async () => {
      const userData = {
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
      };

      await User.create(userData);

      const response = await request(app)
        .post("/api/auth/register")
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it("should return validation error for invalid data", async () => {
      const badUserData = {
        name: "J",
        email: "john",
        password: "pass",
      };
      const response = await request(app)
        .post("/api/auth/register")
        .send(badUserData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Validation error");
    });
  });

  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      const user = new User({
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
      });
      await user.save();
    });

    it("should login with valid credentials", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "john@example.com",
          password: "password123",
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
    });

    it("should not login with invalid credentials", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "john@example.com",
          password: "wrongpassword",
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it("should return validation error for invalid data", async () => {
      const badUserData = {
        email: "john",
        password: "",
      };
      const response = await request(app)
        .post("/api/auth/login")
        .send(badUserData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Validation error");
    });
  });
});
```

## Tests for Route protection and Data Validation

### Add function to create test user in test setup

### Update src/tests/setup.ts

```ts
import { User } from "../models/User";
import { generateToken } from "../utils/jwt";
// ...
// ...
export const createTestUser = async () => {
  const user = new User({
    name: "Test User",
    email: "test@example.com",
    password: "password123",
  });
  await user.save();

  const token = generateToken(user._id.toString());
  return { user, token };
};

export const createTestUser2 = async () => {
  const user = new User({
    name: "Test User 2",
    email: "test2@example.com",
    password: "password123",
  });
  await user.save();

  const token = generateToken(user._id.toString());
  return { user, token };
};
```

### Create user before running task tests

### Update src/tests/tasks.test.ts

```ts
import { createTestUser, createTestUser2 } from "./setup";
// ...

describe("Tasks API", () => {
  let authToken1: string;
  let authToken2: string;
  let user1Id: string;
  let user2Id: string;

  beforeEach(async () => {
    const { token: token1, user: u1 } = await createTestUser();
    const { token: token2, user: u2 } = await createTestUser2();

    authToken1 = token1;
    authToken2 = token2;
    user1Id = u1._id.toString();
    user2Id = u2._id.toString();
  });

  describe("POST /api/tasks", () => {
    it("should create a new task", async () => {
      const taskData = {
        title: "Test Task",
        description: "Test Description",
        priority: "high",
      };

      const response = await request(app)
        .post("/api/tasks")
        .set("Authorization", `Bearer ${authToken1}`)
        .send(taskData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(taskData.title);
      expect(response.body.data.description).toBe(taskData.description);
      expect(response.body.data.priority).toBe(taskData.priority);
      expect(response.body.data.completed).toBe(false);
    });

    it("should return 401 without authentication", async () => {
      const response = await request(app)
        .post("/api/tasks")
        .send({ title: "Test Task" })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it("should return validation error for invalid data", async () => {
      const response = await request(app)
        .post("/api/tasks")
        .set("Authorization", `Bearer ${authToken1}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Validation error");
    });
  });
  // ...
  // ...
});
```

## Add User - Task Relationship

### Update (`src/models/Task.ts`)

```ts
// ...
export interface ITask extends Document {
  // ...
  createdBy: mongoose.Types.ObjectId;
  // ...
}

const TaskSchema = new Schema<ITask>(
  {
    // ...
    // ...
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
```

### Update (`src/controllers/taskController.ts`)

```ts
// Add createdBy
// ....
const task = new Task({
  ...taskData,
  createdBy: (req as any).user._id,
  dueDate: taskData.dueDate ? new Date(taskData.dueDate) : undefined,
});
// ....
```

### Update (`src/tests/tasks.test.ts`)

```ts
it("should create a new task", async () => {
  // ....
  // ....
  // ....
  expect(response.body.data.createdBy.toString()).toBe(user1Id);
});
// ....
// ....
// ....
// Add createdBy
describe("GET /api/tasks", () => {
  beforeEach(async () => {
    await Task.create([
      {
        title: "Task 1",
        completed: false,
        priority: "low",
        createdBy: user1Id,
      },
      {
        title: "Task 2",
        completed: true,
        priority: "high",
        createdBy: user1Id,
      },
      {
        title: "Task 3",
        completed: false,
        priority: "medium",
        createdBy: user2Id,
      },
    ]);
  });
});
```

## Adding Update Task Feature

### Update (`src/schemas/taskSchemas.ts`)

```ts
// ...
export const updateTaskSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  completed: z.boolean().optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  dueDate: z.string().datetime().optional(),
});

export const taskParamsSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid task ID format"),
});

// ...

export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type TaskParams = z.infer<typeof taskParamsSchema>;
```

### Update (`src/middleware/validation.ts`)

```ts
import { TaskParams } from "../schemas/taskSchemas";
// ...
export const validateParams = (schema: ZodSchema): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.params = schema.parse(req.params) as TaskParams;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          message: "Invalid parameters",
          errors: error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        });
        return;
      }
      next(error);
    }
  };
};
```

### Update (`src/controllers/taskController.ts`)

```ts
import { CreateTaskInput, UpdateTaskInput } from "../schemas/taskSchemas";
// ...
export const updateTask = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const updateData: UpdateTaskInput = req.body;

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, createdBy: (req as any).user._id },
      {
        ...updateData,
        dueDate: updateData.dueDate ? new Date(updateData.dueDate) : undefined,
      },
      { new: true, runValidators: true }
    );

    if (!task) {
      res.status(404).json({
        success: false,
        message: "Task not found or you do not have permission to update it",
      });
      return;
    }

    res.json({
      success: true,
      message: "Task updated successfully",
      data: task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating task",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
```

### Update (`src/routes/taskRoutes.ts`)

```ts
import {
  getTasks,
  createTask,
  updateTask,
} from "../controllers/taskController";
import { validateBody, validateParams } from "../middleware/validation";
import {
  createTaskSchema,
  updateTaskSchema,
  taskParamsSchema,
} from "../schemas/taskSchemas";

/**
 * @swagger
 * /api/tasks/{id}:
 *   put:
 *     summary: Update a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               completed:
 *                 type: boolean
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Task updated successfully
 *       404:
 *         description: Task not found
 */
router.put(
  "/:id",
  authenticate,
  validateParams(taskParamsSchema),
  validateBody(updateTaskSchema),
  updateTask
);
```

### Update (`src/tests/tasks.test.ts`)

```ts
describe("Tasks API", () => {
  // ....
  // ....
  // ....
  describe("PUT /api/tasks/:id", () => {
    let user1TaskId: string;
    let user2TaskId: string;

    beforeEach(async () => {
      const task1 = await Task.create({
        title: "User1 Task",
        createdBy: user1Id,
      });
      const task2 = await Task.create({
        title: "User2 Task",
        createdBy: user2Id,
      });

      user1TaskId = task1._id.toString();
      user2TaskId = task2._id.toString();
    });

    it("should update own task", async () => {
      const updateData = { title: "Updated User1 Task" };

      const response = await request(app)
        .put(`/api/tasks/${user1TaskId}`)
        .set("Authorization", `Bearer ${authToken1}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(updateData.title);
    });

    it("should not update other user's task", async () => {
      const updateData = { title: "Trying to update" };

      const response = await request(app)
        .put(`/api/tasks/${user2TaskId}`)
        .set("Authorization", `Bearer ${authToken1}`)
        .send(updateData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe(
        "Task not found or you do not have permission to update it"
      );
    });

    it("should return 401 without authentication", async () => {
      const response = await request(app)
        .put(`/api/tasks/${user1TaskId}`)
        .send({ title: "Updated" })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it("should return 404 for non-existent task", async () => {
      const fakeId = "507f1f77bcf86cd799439011";
      const response = await request(app)
        .put(`/api/tasks/${fakeId}`)
        .set("Authorization", `Bearer ${authToken1}`)
        .send({ title: "Updated" })
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it("should return validation error for invalid data", async () => {
      const response = await request(app)
        .put(`/api/tasks/${user1TaskId}`)
        .set("Authorization", `Bearer ${authToken1}`)
        .send({ title: "" })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Validation error");
    });

    it("should return validation error for invalid params", async () => {
      const response = await request(app)
        .put(`/api/tasks/invalid-id`)
        .set("Authorization", `Bearer ${authToken1}`)
        .send({ title: "Updated title" })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Invalid parameters");
    });
  });
});
```

## Adding Delete Task Feature

### Update (`src/controllers/taskController.ts`)

```ts
export const deleteTask = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      createdBy: (req as any).user._id,
    });

    console.log((req as any).user._id);
    console.log(task);

    if (!task) {
      res.status(404).json({
        success: false,
        message: "Task not found or you do not have permission to delete it",
      });
      return;
    }

    res.json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting task",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
```

### Update (`src/routes/taskRoutes.ts`)

```ts
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from "../controllers/taskController";

/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     summary: Delete a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *       404:
 *         description: Task not found
 */
router.delete(
  "/:id",
  authenticate,
  validateParams(taskParamsSchema),
  deleteTask
);
```

### Update (`src/tests/tasks.test.ts`)

```ts
describe("Tasks API", () => {
  // ....
  // ....
  // ....
  describe("DELETE /api/tasks/:id", () => {
    let user1TaskId: string;
    let user2TaskId: string;

    beforeEach(async () => {
      const task1 = await Task.create({
        title: "User1 Task",
        createdBy: user1Id,
      });
      const task2 = await Task.create({
        title: "User2 Task",
        createdBy: user2Id,
      });

      user1TaskId = task1._id.toString();
      user2TaskId = task2._id.toString();
    });

    it("should delete own task", async () => {
      const response = await request(app)
        .delete(`/api/tasks/${user2TaskId}`)
        .set("Authorization", `Bearer ${authToken2}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Task deleted successfully");

      const deletedTask = await Task.findById(user2TaskId);
      expect(deletedTask).toBeNull();
    });

    it("should not delete other user's task", async () => {
      const response = await request(app)
        .delete(`/api/tasks/${user1TaskId}`)
        .set("Authorization", `Bearer ${authToken2}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe(
        "Task not found or you do not have permission to delete it"
      );

      const task = await Task.findById(user2TaskId);
      expect(task).not.toBeNull();
    });

    it("should return 401 without authentication", async () => {
      const response = await request(app)
        .delete(`/api/tasks/${user1TaskId}`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it("should return 404 for non-existent task", async () => {
      const fakeId = "507f1f77bcf86cd799439011";
      const response = await request(app)
        .delete(`/api/tasks/${fakeId}`)
        .set("Authorization", `Bearer ${authToken1}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it("should return validation error for invalid params", async () => {
      const response = await request(app)
        .delete(`/api/tasks/invalid-id`)
        .set("Authorization", `Bearer ${authToken1}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Invalid parameters");
    });
  });
});
```

## Adding Get Task By Id

### Update (`src/controllers/taskController.ts`)

```ts
export const getTaskById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404).json({
        success: false,
        message: "Task not found",
      });
      return; // Important: return after sending response
    }

    res.json({
      success: true,
      data: task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching task",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
```

### Update (`src/routes/taskRoutes.ts`)

```ts
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getTaskById,
} from "../controllers/taskController";

/**
 * @swagger
 * /api/tasks/{id}:
 *   get:
 *     summary: Get task by ID
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Task details
 *       404:
 *         description: Task not found
 */
router.get("/:id", validateParams(taskParamsSchema), getTaskById);
```

### Update (`src/tests/tasks.test.ts`)

```ts
describe("Tasks API", () => {
  // ....
  // ....
  // ....
  describe("GET /api/tasks/:id", () => {
    let taskId: string;

    beforeEach(async () => {
      const task = await Task.create({
        title: "Test Task",
        description: "Test Description",
        createdBy: user2Id,
      });
      taskId = task._id.toString();
    });

    it("should get task by ID", async () => {
      const response = await request(app)
        .get(`/api/tasks/${taskId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe("Test Task");
    });

    it("should return 404 for non-existent task", async () => {
      const fakeId = "507f1f77bcf86cd799439011";
      const response = await request(app)
        .get(`/api/tasks/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Task not found");
    });

    it("should return 400 for invalid ID format", async () => {
      const response = await request(app)
        .get("/api/tasks/invalid-id")
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Invalid parameters");
    });
  });
});
```

## Adding Filter and Pagination in get all Tasks

### Update (`src/schemas/taskSchemas.ts`)

```ts
// ...
export const taskQuerySchema = z.object({
  completed: z.enum(["true", "false"]).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  page: z.string().regex(/^\d+$/).optional(),
  limit: z.string().regex(/^\d+$/).optional(),
});

// ...

export type TaskQuery = z.infer<typeof taskQuerySchema>;
```

### Update (`src/middleware/validation.ts`)

```ts
export const validateQuery = (schema: ZodType): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          message: "Invalid query parameters",
          errors: error.issues.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        });
        return;
      }
      next(error);
    }
  };
};
```

### Update (`src/controllers/taskController.ts`)

```ts
import {
  CreateTaskInput,
  UpdateTaskInput,
  TaskQuery,
} from "../schemas/taskSchemas";

// Update code of try block
export const getTasks: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      completed,
      priority,
      page = "1",
      limit = "10",
    } = req.query as TaskQuery;

    const filter: any = {};

    if (completed !== undefined) {
      filter.completed = completed === "true";
    }
    if (priority) {
      filter.priority = priority;
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const tasks = await Task.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Task.countDocuments(filter);

    res.json({
      success: true,
      data: {
        tasks,
        pagination: {
          current: pageNum,
          total: Math.ceil(total / limitNum),
          count: tasks.length,
          totalItems: total,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching tasks",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
```

### Update (`src/routes/taskRoutes.ts`)

```ts
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../middleware/validation";
import {
  createTaskSchema,
  updateTaskSchema,
  taskParamsSchema,
  taskQuerySchema,
} from "../schemas/taskSchemas";

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Get all tasks
 *     tags: [Tasks]
 *     parameters:
 *       - in: query
 *         name: completed
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Filter by completion status
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high]
 *         description: Filter by priority
 *       - in: query
 *         name: page
 *         schema:
 *           type: string
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: string
 *         description: Items per page
 *     responses:
 *       200:
 *         description: List of tasks
 */
router.get("/", validateQuery(taskQuerySchema), getTasks);
```

### Update (`src/tests/tasks.test.ts`)

```ts
describe("Tasks API", () => {
  // ....
  // ....
  // ....
  describe("GET /api/tasks", () => {
    // ....
    // ....
    // ....

    it("should get all tasks", async () => {
      const response = await request(app).get("/api/tasks").expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.tasks).toHaveLength(3);
      expect(response.body.data.pagination.totalItems).toBe(3);
    });

    it("should filter tasks by completion status", async () => {
      const response = await request(app)
        .get("/api/tasks?completed=true")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.tasks).toHaveLength(1);
      expect(response.body.data.tasks[0].completed).toBe(true);
    });

    it("should filter tasks by priority", async () => {
      const response = await request(app)
        .get("/api/tasks?priority=high")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.tasks).toHaveLength(1);
      expect(response.body.data.tasks[0].priority).toBe("high");
    });

    it("should give query validation error", async () => {
      const response = await request(app)
        .get("/api/tasks?priority=higher&completed=done")
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Invalid query parameters");
    });
  });
});
```
