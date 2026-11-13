require("dotenv").config();

const config = {
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET,
  nodeEnv: process.env.NODE_ENV || "development",
};

// Task 5.1 Requirement: Validate required settings at startup
if (!config.jwtSecret) {
  console.error(
    "Configuration Error: Missing required environment variable: JWT_SECRET",
  );
  process.exit(1);
}

if (config.jwtSecret.length < 32) {
  console.error(
    "Configuration Error: JWT_SECRET must be at least 32 characters long",
  );
  process.exit(1);
}

module.exports = config;
