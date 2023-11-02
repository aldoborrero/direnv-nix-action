const core = require("@actions/core");
const exec = require("@actions/exec");
const io = require("@actions/io");

/**
 * Check if a given binary is installed and throw an error if it's not.
 * @param {string} binaryName - The name of the binary to check.
 * @returns {Promise<void>} A promise indicating the completion of the check.
 * @throws {Error} Throws an error if the binary is not installed.
 */
async function isBinaryInstalled(binaryName) {
  const binaryPath = await io.which(binaryName, true);
  if (!binaryPath) {
    throw new Error(`${binaryName} binary is not installed.`);
  }
}
/**
 * Install direnv using Nix.
 * @returns {Promise<void>} A promise indicating the completion of the installation.
 */
async function installDirenv() {
  core.info("Installing direnv...");
  const useNixProfile = core.getInput("use_nix_profile") === "true";
  if (useNixProfile) {
    core.info("Installing direnv using nix profile...");
    await exec.exec("nix", ["profile", "install", "nixpkgs#direnv"]);
  } else {
    core.info("Installing direnv using nix-env...");
    await exec.exec("nix-env", ["-i", "direnv", "-f", "<nixpkgs>"]);
  }
}

/**
 * Allow the .envrc file.
 * @returns {Promise<void>} A promise indicating the completion of the operation.
 */
async function allowEnvrc() {
  core.info("Allowing .envrc...");
  await exec.exec("direnv", ["allow"]);
}

/**
 * Export envrc to JSON format.
 * @returns {Promise<object>} A promise that resolves to the envrc in JSON format.
 */
async function exportEnvrc() {
  let outputBuffer = "";
  const options = {
    listeners: {
      stdout: (data) => {
        outputBuffer += data.toString();
      },
    },
  };
  core.info("Exporting envrc...");
  await exec.exec("direnv", ["export", "json"], options);
  return JSON.parse(outputBuffer);
}

/**
 * Set environment variables from the provided envs object.
 * @param {object} envs - The environment variables to set.
 */
function setEnvironmentVariables(envs) {
  for (const [name, value] of Object.entries(envs)) {
    if (name === "PATH") {
      core.info("Detected PATH in .envrc, appending to PATH...");
      core.addPath(value);
    } else {
      core.exportVariable(name, value);
    }
  }
}

// Action entrypoint
async function main() {
  await isBinaryInstalled("nix");

  // Check if direnv is installed before attempting installation
  try {
    await isBinaryInstalled("direnv");
    core.info("direnv is already installed.");
  } catch (error) {
    core.info(error.message);
    await installDirenv();
  }

  await allowEnvrc();
  const envs = await exportEnvrc();
  setEnvironmentVariables(envs);
}

// Run!
main().catch((error) => {
  core.setFailed(error.message);
});
