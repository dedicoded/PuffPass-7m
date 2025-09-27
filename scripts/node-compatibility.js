// Node.js version compatibility checker for MyCora/PuffPass
// Ensures minimum Node.js v18.12 requirement

const [major, minor] = process.version.slice(1).split(".")

// Check for minimum Node.js version requirement
if (major < 18 || (major == 18 && minor < 12)) {
  console.error(`❌ ERROR: This project requires at least Node.js v18.12`)
  console.error(`The current version of Node.js is ${process.version}`)
  console.log("💡 Please upgrade your Node.js version to continue")
  process.exit(1)
}

console.log(`✅ Node.js version ${process.version} is compatible`)
