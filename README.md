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

# MERN Stack CRUD Task App - Complete Guide

## Table of Contents

1. [Project Overview](#project-overview)
2. [Project Setup](#project-setup)
3. [Add Database](#add-database)
4. [Create Task Collection Schema](#create-task-collection-schema)
5. [Create Task Controller and Routes](#create-task-controller-and-routes)
6. [Add error handler and 404 handler](#add-error-handler-and-404-handler)
7. [Testing with Jest](#testing-with-jest)

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
│  │   ├── controllers/
│  │   │   └── taskController.test.ts
│  │   ├── models/
│  │   │   └── Task.test.ts
│  │   └── routes/
│  │       └── taskRoutes.test.ts
│  └── app.ts
├── .env.json
├── .gitignore.json
├── package-lock.json
├── package.json
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
